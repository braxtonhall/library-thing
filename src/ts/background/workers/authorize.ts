import {WorkerError, WorkerErrorKind} from "../../common/workers/types";
import {BackgroundEvent} from "../../common/backgroundEvent";
import {dispatchEvent} from "./dispatchEvent";
import * as browser from "webextension-polyfill";
import storage from "../../common/adapters/storage";

type AuthorizeParameters = boolean;
type AuthorizeResponse = string;

type TokenRecord = {token: string; expiresAt: number};

const isTokenRecord = (record: unknown): record is TokenRecord =>
	record && typeof record === "object" && "token" in record && "expiresAt" in record;

const parseAccessToken = (responseUrl: string): {token: string; expiresIn: number} => {
	const {hash} = new URL(responseUrl);
	const paramsString = hash.slice(1); // remove the "#" from the beginning
	const params = new URLSearchParams(paramsString);
	return {token: params.get("access_token"), expiresIn: Number(params.get("expires_in"))};
};

const getRedirectURL = (): string => {
	const baseRedirectUrl = browser.identity.getRedirectURL();
	if (baseRedirectUrl.includes("chromium")) {
		return baseRedirectUrl;
	} else {
		const redirectSubdomain = baseRedirectUrl.match(/https:\/\/([^.]*)/)[1];
		return `http://127.0.0.1/mozoauth2/${redirectSubdomain}`;
	}
};

const getAuthUrl = () => {
	const manifest = browser.runtime.getManifest() as any; // TODO there must be a way to fix this
	const url = new URL("https://accounts.google.com/o/oauth2/auth");
	const params = new URLSearchParams({
		client_id: manifest.oauth2.client_id,
		response_type: "token",
		redirect_uri: getRedirectURL(),
		scope: manifest.oauth2.scopes.join(" "),
	});
	url.search = params.toString();
	return url.toString();
};

const setCachedToken = async (token: string, expiresIn: number): Promise<void> => {
	const millisecondsRemaining = expiresIn * 1000;
	const now = Date.now();
	const fiveMinuteBuffer = 1000 * 60 * 5;
	const expiresAt = now + millisecondsRemaining - fiveMinuteBuffer;
	await storage.set("token", {token, expiresAt} satisfies TokenRecord);
};

const getCachedToken = async (): Promise<string | undefined> => {
	const record = await storage.get("token");
	if (isTokenRecord(record)) {
		const {token, expiresAt} = record;
		if (Date.now() < expiresAt) {
			return token;
		} else {
			await clearCachedToken();
		}
	}
};

const clearCachedToken = (): Promise<void> => storage.set("token", undefined);

const onResponse = async (responseUrl?: string): Promise<string> => {
	const {token, expiresIn} = parseAccessToken(responseUrl);
	await setCachedToken(token, expiresIn);
	if (token) {
		return token;
	} else {
		throw new WorkerError(WorkerErrorKind.Unknown, "Could not parse access token");
	}
};

const getAuthToken = async (interactive: boolean): Promise<string> => {
	const cachedToken = await getCachedToken();
	if (cachedToken) {
		return cachedToken;
	} else if (browser?.identity?.launchWebAuthFlow) {
		return browser.identity
			.launchWebAuthFlow({url: getAuthUrl(), interactive})
			.catch(({message}) => {
				/*
				 * this appears to be erroring with the following message:
				 *
				 * "User interaction required.
				 *  Try setting `abortOnLoadForNonInteractive` and `timeoutMs For NonInteractive`
				 *  if multiple navigations are required, or if code is used
				 *  for redirects in the authorization page after it's loaded."
				 *
				 * but it's still logging in and setting the token correctly in storage
				 *
				 * log the error message, but don't block the existing login flow
				 * https://github.com/braxtonhall/library-thing/issues/288
				 * */

				console.error(message);
			})
			.then(onResponse);
	} else {
		throw new WorkerError(WorkerErrorKind.UnsupportedBrowser, "Unsupported browser :(");
	}
};

const authorize = async (interactive: AuthorizeParameters): Promise<AuthorizeResponse> =>
	getAuthToken(interactive).then((token) => {
		if (token && interactive) {
			dispatchEvent(BackgroundEvent.CompletedAuth);
		}
		return token;
	});

type DeAuthorizeParameters = undefined;
type DeAuthorizeResponse = void;

const deAuthorize = async (): Promise<DeAuthorizeResponse> => {
	try {
		const token = await authorize(false);
		const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
		await fetch(url);
		await clearCachedToken();
		return dispatchEvent(BackgroundEvent.RemovedAuth);
	} catch (error) {
		console.error(error);
		throw new Error("Could not de-authorize");
	}
};

export {authorize, AuthorizeParameters, AuthorizeResponse};
export {deAuthorize, DeAuthorizeParameters, DeAuthorizeResponse};
