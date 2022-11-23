import {WorkerError, WorkerErrorKind} from "../../common/workers/types";
import {BackgroundEvent} from "../../common/backgroundEvent";
import {dispatchEvent} from "../util/dispatchEvent";

type AuthorizeParameters = boolean;
type AuthorizeResponse = string;

const parseAccessToken = (responseUrl: string) => {
	const {hash} = new URL(responseUrl);
	const paramsString = hash.slice(1); // remove the "#" from the beginning
	return new URLSearchParams(paramsString).get("access_token");
};

const getAuthUrl = () => {
	const manifest = chrome.runtime.getManifest();
	const url = new URL("https://accounts.google.com/o/oauth2/auth");
	const params = new URLSearchParams({
		client_id: manifest.oauth2.client_id,
		response_type: "token",
		redirect_uri: chrome.identity.getRedirectURL(),
		scope: manifest.oauth2.scopes.join(","),
	});
	url.search = params.toString();
	return url.toString();
};

const onResponse = (resolve, reject, interactive: boolean) => (responseUrl?: string) => {
	if (responseUrl) {
		const token = parseAccessToken(responseUrl);
		if (token) {
			if (interactive) {
				dispatchEvent(BackgroundEvent.CompletedAuth);
			}
			resolve(token);
		} else {
			reject(new WorkerError(WorkerErrorKind.Unknown, "Could not parse access token"));
		}
	} else {
		const {message} = chrome.runtime.lastError;
		reject(new WorkerError(WorkerErrorKind.Unknown, message));
	}
};

const authorize = (interactive: AuthorizeParameters): Promise<AuthorizeResponse> =>
	new Promise((resolve, reject) => {
		if (chrome?.identity?.launchWebAuthFlow) {
			return chrome.identity.launchWebAuthFlow(
				{url: getAuthUrl(), interactive},
				onResponse(resolve, reject, interactive)
			);
		} else {
			return reject(new WorkerError(WorkerErrorKind.UnsupportedBrowser, "Unsupported browser :("));
		}
	});

type DeAuthorizeParameters = undefined;
type DeAuthorizeResponse = void;

const removeToken = (token: string) =>
	new Promise<void>((resolve) => chrome.identity.removeCachedAuthToken({token}, resolve));

const deAuthorize = async (): Promise<DeAuthorizeResponse> => {
	try {
		const token = await authorize(false);
		const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
		await fetch(url);
		return removeToken(token).then(() => dispatchEvent(BackgroundEvent.RemovedAuth));
	} catch (error) {
		console.error(error);
		throw new Error("Could not de-authorize");
	}
};

export {authorize, AuthorizeParameters, AuthorizeResponse};
export {deAuthorize, DeAuthorizeParameters, DeAuthorizeResponse};
