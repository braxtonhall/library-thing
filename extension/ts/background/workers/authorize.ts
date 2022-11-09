import {WorkerError, WorkerErrorKind} from "../../common/workers/types";
import {BackgroundEvent} from "../../common/backgroundEvent";
import {dispatchEvent} from "../util/dispatchEvent";

type AuthorizeParameters = boolean;
type AuthorizeResponse = string;

const authorize = (interactive: AuthorizeParameters): Promise<AuthorizeResponse> =>
	new Promise((resolve, reject) => {
		if (chrome?.identity?.getAuthToken) {
			return chrome.identity.getAuthToken({interactive}, (auth) => {
				if (auth) {
					if (interactive) {
						dispatchEvent(BackgroundEvent.CompletedAuth);
					}
					resolve(auth);
				} else {
					const {message} = chrome.runtime.lastError;
					reject(new WorkerError(WorkerErrorKind.Unknown, message));
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
