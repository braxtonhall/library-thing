import {googleFetch} from "../../services/google/googleFetch";

const BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets";

type Range = `${string}!${string}` | `${string}!${string}:${string}`;
type Values = string[][];

interface ValueRange {
	range: Range;
	values: Values;
}

interface SheetsDataValueRange extends ValueRange {
	majorDimension: string;
}

export interface GetSheetsDataResponse {
	spreadsheetId: string;
	valueRanges: SheetsDataValueRange[];
}
interface UpdateSheetsDataResponse {
	spreadsheetId: string;
	updatedRange: string;
	updatedCells: number;
	updatedRows: number;
	updatedColumns: number;
	updatedData: SheetsDataValueRange;
}

export interface AppendSheetsDataResponse {
	spreadsheetId: string;
	tableRange: string;
	updates: UpdateSheetsDataResponse;
}

const readRanges = async (spreadsheetId: string, ranges: Range[]): Promise<ValueRange[] | null> => {
	const queryParams = ranges.reduce((acc, range) => {
		acc.append("ranges", range);
		return acc;
	}, new URLSearchParams({}));

	const url = `${BASE_URL}/${spreadsheetId}/values:batchGet?${queryParams}`;
	const response: GetSheetsDataResponse = await googleFetch(url);
	return response?.valueRanges ?? null;
};

const appendRowToSheet = async (spreadsheetId: string, range: string, values: Values): Promise<ValueRange | null> => {
	const options: RequestInit = {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values}),
	};

	const url = `${BASE_URL}/${spreadsheetId}/values/${range}:append?${new URLSearchParams({
		includeValuesInResponse: "true",
		insertDataOption: "INSERT_ROWS",
		valueInputOption: "USER_ENTERED",
	})}`;
	const response: AppendSheetsDataResponse = await googleFetch(url, options);
	return response?.updates?.updatedData ?? null;
};

const updateRowInSheet = async (spreadsheetId: string, range: string, values: Values): Promise<ValueRange | null> => {
	const options: RequestInit = {
		method: "PUT",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({values}),
	};

	const url = `${BASE_URL}/${spreadsheetId}/values/${range}?${new URLSearchParams({
		includeValuesInResponse: "true",
		valueInputOption: "USER_ENTERED",
	})}`;
	const response: UpdateSheetsDataResponse = await googleFetch(url, options);
	return response?.updatedData ?? null;
};

const createRange = (sheet: string, from: string, to?: string): Range => `${sheet}!${from}${to ? `:${to}` : ""}`;

export type {ValueRange, Range, Values};
export default {readRanges, appendRowToSheet, updateRowInSheet, createRange};
