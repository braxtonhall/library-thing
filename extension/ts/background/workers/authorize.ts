import {WorkerError, WorkerErrorKind} from "../../common/workers/types";
import {BackgroundEvent} from "../../common/backgroundEvent";
import {dispatchEvent} from "../util/dispatchEvent";
import * as browser from "webextension-polyfill";

type AuthorizeParameters = boolean;
type AuthorizeResponse = string;

const parseAccessToken = (responseUrl: string) => {
	const {hash} = new URL(responseUrl);
	const paramsString = hash.slice(1); // remove the "#" from the beginning
	return new URLSearchParams(paramsString).get("access_token");
};

const getAuthUrl = () => {
	const manifest = browser.runtime.getManifest() as any; // TODO there must be a way to fix this
	const url = new URL("https://accounts.google.com/o/oauth2/auth");
	const params = new URLSearchParams({
		client_id: manifest.oauth2.client_id,
		response_type: "token",
		redirect_uri: browser.identity.getRedirectURL(),
		scope: manifest.oauth2.scopes.join(","),
	});
	url.search = params.toString();
	return url.toString();
};

const onResponse =
	(interactive: boolean) =>
	(responseUrl?: string): string => {
		const token = parseAccessToken(responseUrl);
		if (token) {
			if (interactive) {
				dispatchEvent(BackgroundEvent.CompletedAuth);
			}
			return token;
		} else {
			throw new WorkerError(WorkerErrorKind.Unknown, "Could not parse access token");
		}
	};

const authorize = async (interactive: AuthorizeParameters): Promise<AuthorizeResponse> => {
	if (browser?.identity?.launchWebAuthFlow) {
		return browser.identity
			.launchWebAuthFlow({url: getAuthUrl(), interactive})
			.catch(({message}) => {
				throw new WorkerError(WorkerErrorKind.Unknown, message);
			})
			.then(onResponse(interactive));
	} else {
		throw new WorkerError(WorkerErrorKind.UnsupportedBrowser, "Unsupported browser :(");
	}
};

type DeAuthorizeParameters = undefined;
type DeAuthorizeResponse = void;

const deAuthorize = async (): Promise<DeAuthorizeResponse> => {
	try {
		const token = await authorize(false);
		const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
		await fetch(url);
		return dispatchEvent(BackgroundEvent.RemovedAuth);
	} catch (error) {
		console.error(error);
		throw new Error("Could not de-authorize");
	}
};

export {authorize, AuthorizeParameters, AuthorizeResponse};
export {deAuthorize, DeAuthorizeParameters, DeAuthorizeResponse};
