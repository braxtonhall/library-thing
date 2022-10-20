type AuthorizeParameters = boolean;
type AuthorizeResponse = string;

const authorize = (interactive: AuthorizeParameters): Promise<AuthorizeResponse> =>
	new Promise((resolve, reject) => {
		if (chrome?.identity?.getAuthToken) {
			return chrome.identity.getAuthToken({interactive}, resolve);
		} else {
			// TODO use chrome.identity.launchWebAuthFlow
			// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow
			return reject(new Error("Unsupported browser :("));
		}
	});

export {authorize, AuthorizeParameters, AuthorizeResponse};
