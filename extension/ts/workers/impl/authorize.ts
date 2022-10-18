type AuthorizeParameters = null;
type AuthorizeResponse = string;

const authorize = (): Promise<AuthorizeResponse> =>
	new Promise((resolve) =>
		chrome.identity.getAuthToken(
			{
				interactive: true,
			},
			resolve
		)
	);

export {authorize, AuthorizeParameters, AuthorizeResponse};
