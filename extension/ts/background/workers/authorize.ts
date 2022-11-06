import {WorkerError, WorkerErrorKind} from "../../common/workers/types";

type AuthorizeParameters = boolean;
type AuthorizeResponse = string;

const authorize = (interactive: AuthorizeParameters): Promise<AuthorizeResponse> =>
	new Promise((resolve, reject) => {
		if (chrome?.identity?.getAuthToken) {
			return chrome.identity.getAuthToken({interactive}, (auth) => {
				if (auth) {
					broadcastAuthorization();
					resolve(auth);
				} else {
					reject(new WorkerError(WorkerErrorKind.Unknown, "Auth not granted"));
				}
			});
		} else {
			// TODO use chrome.identity.launchWebAuthFlow
			// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow
			return reject(new WorkerError(WorkerErrorKind.UnsupportedBrowser, "Unsupported browser :("));
		}
	});

type DeAuthorizeParameters = undefined;
type DeAuthorizeResponse = void;

const deAuthorize = async (): Promise<DeAuthorizeResponse> => {
	try {
		const token = await authorize(false);
		const url = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
		await fetch(url);
		return new Promise((resolve) => chrome.identity.removeCachedAuthToken({token}, resolve));
	} catch (error) {
		console.error(error);
		throw new Error("Could not de-authorize");
	}
};

const broadcastAuthorization = () => {
	const matches = chrome.runtime.getManifest().content_scripts.flatMap((contentScript) => contentScript.matches);
	chrome.tabs.query({url: matches}, (tabs) => tabs.forEach((tab) => chrome.tabs.sendMessage(tab.id, "authed")));
};

export {authorize, AuthorizeParameters, AuthorizeResponse};
export {deAuthorize, DeAuthorizeParameters, DeAuthorizeResponse};
