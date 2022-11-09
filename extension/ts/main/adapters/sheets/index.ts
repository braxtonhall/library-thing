import {googleFetch} from "../../services/google/googleFetch";

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

type Range = `${string}!${string}` | `${string}!${string}:${string}`;

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

const readRanges = (spreadsheetId: string, ranges: string[]): Promise<GetSheetsDataResponse | null> => {
	const queryParams = ranges.reduce((acc, range) => {
		acc.append("ranges", range);
		return acc;
	}, new URLSearchParams({}));

	return googleFetch(`${BASE_URL}/${spreadsheetId}/values:batchGet?${queryParams}`);
};

const appendRowToSheet = (
	spreadsheetId: string,
	range: string,
	values: string[][]
): Promise<AppendSheetsDataResponse | null> => {
	const options: RequestInit = {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values}),
	};

	return googleFetch(
		`${BASE_URL}/${spreadsheetId}/values/${range}:append?${new URLSearchParams({
			includeValuesInResponse: "true",
			insertDataOption: "INSERT_ROWS",
			valueInputOption: "USER_ENTERED",
		})}`,
		options
	);
};

const updateRowInSheet = (
	spreadsheetId: string,
	range: string,
	values: string[][]
): Promise<UpdateSheetsDataResponse | null> => {
	const options: RequestInit = {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values}),
	};

	return googleFetch(
		`${BASE_URL}/${spreadsheetId}/values/${range}?${new URLSearchParams({
			includeValuesInResponse: "true",
			valueInputOption: "USER_ENTERED",
		})}`,
		options
	);
};

const createRange = (sheet: string, from: string, to?: string): Range => `${sheet}!${from}${to ? `:${to}` : ""}`;

export type {ValueRange};
export default {readRanges, appendRowToSheet, updateRowInSheet, createRange};
