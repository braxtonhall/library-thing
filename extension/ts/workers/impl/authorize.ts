type AuthorizeParameters = null;
type AuthorizeResponse = string;

const authorize = (): Promise<AuthorizeResponse> =>
	new Promise((resolve, reject) => {
		if (chrome?.identity?.getAuthToken) {
			return chrome.identity.getAuthToken({interactive: true}, resolve);
		} else {
			// TODO use chrome.identity.launchWebAuthFlow
			return reject(new Error("Unsupported browser :("));
		}
	});

export {authorize, AuthorizeParameters, AuthorizeResponse};
