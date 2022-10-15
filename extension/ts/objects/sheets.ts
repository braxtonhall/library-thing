import Auth from "./auth";

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

interface ValueRange {
	range: string;
	majorDimension: string;
	values: string[][];
}

export interface GetSheetsDataResponse {
	spreadsheetId: string;
	valueRanges: ValueRange[];
}

interface UpdateSheetsDataResponse {
	spreadsheetId: string;
	updatedRange: string;
	updatedCells: number;
	updatedRows: number;
	updatedColumns: number;
	updatedData: ValueRange;
}

export interface AppendSheetsDataResponse {
	spreadsheetId: string;
	tableRange: string;
	updates: UpdateSheetsDataResponse;
}

const handleError = (res: Response) => {
	if (res.status >= 400) {
		Auth.clearAPICredentials();
		alert(
			"Something went wrong when trying to process that action. Please try again and ensure the inputted API key/ Client ID credentials are correct."
		);
	}
};

const readAllRowsFromSheet = async (spreadsheetId: string, ranges: string[]): Promise<GetSheetsDataResponse | null> => {
	const credentials = Auth.getAPICredentials();
	Auth.authorize();

	const queryParams = ranges.reduce((acc, range) => {
		acc.append("ranges", range);
		return acc;
	}, new URLSearchParams({}));
	queryParams.append("key", credentials.apiKey);

	const res = await fetch(`${BASE_URL}/${spreadsheetId}/values:batchGet?${queryParams}`);

	handleError(res);
	return res.status == 200 ? res.json() : null;
};

const appendRowToSheet = async (
	spreadsheetId: string,
	range: string,
	values: string[][]
): Promise<AppendSheetsDataResponse | null> => {
	const credentials = Auth.getAPICredentials();
	Auth.authorize();
	const localStorageOAuth = Auth.getOAuthCredentials();
	const token = localStorageOAuth.access_token;

	const options: RequestInit = {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values}),
	};

	const res = await fetch(
		`${BASE_URL}/${spreadsheetId}/values/${range}:append?${new URLSearchParams({
			includeValuesInResponse: "true",
			insertDataOption: "INSERT_ROWS",
			valueInputOption: "RAW",
			key: credentials.apiKey,
		})}`,
		options
	);

	handleError(res);
	return res.status == 200 ? res.json() : null;
};

const updateRowInSheet = async (
	spreadsheetId: string,
	range: string,
	values: string[][]
): Promise<UpdateSheetsDataResponse | null> => {
	const credentials = Auth.getAPICredentials();
	Auth.authorize();
	const localStorageOAuth = Auth.getOAuthCredentials();
	const token = localStorageOAuth.access_token;

	const options: RequestInit = {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values}),
	};

	const res = await fetch(
		`${BASE_URL}/${spreadsheetId}/values/${range}?${new URLSearchParams({
			includeValuesInResponse: "true",
			valueInputOption: "RAW",
			key: credentials.apiKey,
		})}`,
		options
	);

	handleError(res);
	return res.status == 200 ? res.json() : null;
};

export default {readAllRowsFromSheet, appendRowToSheet, updateRowInSheet};
