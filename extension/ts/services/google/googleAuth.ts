const REDIRECT_URI = "https://www.librarything.com";

const OAUTH_KEY_LOCAL_STORAGE = "_oauth2_params";
const API_KEY_LOCAL_STORAGE = "_api_key";
const CLIENT_ID_LOCAL_STORAGE = "_client_id";

const OAUTH_SCOPES = [
	"https://www.googleapis.com/auth/drive",
	"https://www.googleapis.com/auth/drive.file",
	"https://www.googleapis.com/auth/spreadsheets",
];

interface OAuthParams {
	access_token: string;
	expires_in: string;
	expiry_date: string;
	scope: string;
	token_type: string;
}

interface APICredentials {
	apiKey: string;
	clientID: string;
}

const getAPICredentials = (): APICredentials => {
	if (!isAPICredentialsSavedToLocalStorage()) {
		const apiKey = window.prompt("Please enter the Google Sheets API key");
		const clientID = window.prompt("Please enter the Google Sheets client ID");

		localStorage.setItem(API_KEY_LOCAL_STORAGE, apiKey);
		localStorage.setItem(CLIENT_ID_LOCAL_STORAGE, clientID);
	}

	return {apiKey: localStorage[API_KEY_LOCAL_STORAGE], clientID: localStorage[CLIENT_ID_LOCAL_STORAGE]};
};

const clearAPICredentials = () => {
	localStorage.removeItem(API_KEY_LOCAL_STORAGE);
	localStorage.removeItem(CLIENT_ID_LOCAL_STORAGE);
};

const isAPICredentialsSavedToLocalStorage = () =>
	!!localStorage[API_KEY_LOCAL_STORAGE] &&
	localStorage[API_KEY_LOCAL_STORAGE] !== "null" &&
	!!localStorage[CLIENT_ID_LOCAL_STORAGE] &&
	localStorage[CLIENT_ID_LOCAL_STORAGE] !== "null";

const oauth2SignIn = () => {
	const credentials = getAPICredentials();

	// Google's OAuth 2.0 endpoint for requesting an access token
	const oauth2Endpoint = "https://accounts.google.com/o/oauth2/v2/auth";
	const scope = OAUTH_SCOPES.join(" ");

	// Create element to open OAuth 2.0 endpoint in new window.
	const form = document.createElement("form");
	form.setAttribute("method", "GET"); // Send as a GET request.
	form.setAttribute("action", oauth2Endpoint);

	// Parameters to pass to OAuth 2.0 endpoint.
	const params = {
		client_id: credentials.clientID,
		redirect_uri: REDIRECT_URI,
		state: window.location.href,
		scope,
		include_granted_scopes: "true",
		response_type: "token",
	};

	// Add form parameters as hidden input values.
	for (const p in params) {
		const input = document.createElement("input");
		input.setAttribute("type", "hidden");
		input.setAttribute("name", p);
		input.setAttribute("value", params[p]);
		form.appendChild(input);
	}

	// Add form to page and submit it to open the OAuth 2.0 endpoint.
	document.body.appendChild(form);
	form.submit();
};

const authorize = () => {
	handleOAuthRedirect();
	if (!isSavedCredentialsValid()) {
		oauth2SignIn();
	}
};

const isSavedCredentialsValid = (): boolean => {
	// If OAuth credentials already exist in localStorage
	if (isOAuthCredentialsSavedToLocalStorage()) {
		if (isOAuthTokenExpired()) {
			clearOAuthCredentials();
			return false;
		}
		return true;
	}
	return false;
};

const handleOAuthRedirect = () => {
	const fragmentString = location.hash.substring(1);

	// The token and its related parameters get appended to the redirected URL
	// Parse query string to see if page request is coming from OAuth 2.0 server.
	const params = {};
	const regex = /([^&=]+)=([^&]*)/g;
	let m: RegExpExecArray;
	while ((m = regex.exec(fragmentString))) {
		params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}

	// If we're coming back from an OAuth redirect
	if (Object.keys(params).length > 0) {
		const expiryInSeconds = params["expires_in"];
		if (expiryInSeconds) {
			const now = new Date();
			const expiryTime = new Date(now.getTime() + 1000 * expiryInSeconds);

			params["expiry_date"] = expiryTime.toISOString(); // add expiry_date key/value pair
		}

		const url = params["state"];
		delete params["state"]; // remove state key/value pair

		localStorage.setItem(OAUTH_KEY_LOCAL_STORAGE, JSON.stringify(params));
		if (url) {
			window.location.replace(url);
		}
	}
};

const getOAuthCredentials = (): OAuthParams => JSON.parse(localStorage.getItem(OAUTH_KEY_LOCAL_STORAGE));
const clearOAuthCredentials = () => localStorage.removeItem(OAUTH_KEY_LOCAL_STORAGE);
const isOAuthCredentialsSavedToLocalStorage = () =>
	!!localStorage.getItem(OAUTH_KEY_LOCAL_STORAGE) && !!getOAuthCredentials().access_token;
const isOAuthTokenExpired = () => {
	const localStorageOAuth = getOAuthCredentials();
	const now = new Date();
	const expiryDate = new Date(localStorageOAuth.expiry_date);
	return now.getTime() >= expiryDate.getTime();
};

// Have to run this as soon as the file is imported to ensure that redirect happens
// before any other business logic reads the href which has an unexpected hashroute
// thanks to the redirect uri with encoded state
handleOAuthRedirect();

export default {authorize, clearAPICredentials, getAPICredentials, getOAuthCredentials};
