import Sheets, {GetSheetsDataResponse, ValueRange} from "./sheets";
import {filterAuthorTags} from "../util/filterAuthorTags";
import {makeCache} from "../../common/util/cache";

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin
const AUTHOR_SHEET = "Authors";
const QUERY_SHEET = "LOOKUP";

const {asyncCached, setCache} = makeCache<AuthorRecord>();

/**
 * These are the columns as stored in the Google Sheet
 * INVARIANT: UUID is just left of NAME is just left of TAGS
 *            Much of the code in this file assumes this order
 *            And that they are neighbours
 */
enum Columns {
	UUID = "A",
	NAME = "B",
	TAGS = "C",
}

type Tags = string[];

interface AuthorRecord {
	uuid: string;
	name: string;
	tags: Tags;
}

const selectAll = Sheets.createRange(AUTHOR_SHEET, Columns.UUID, Columns.TAGS);
const selectRow = (row: number) => Sheets.createRange(AUTHOR_SHEET, `${Columns.UUID}${row}`, `${Columns.TAGS}${row}`);

const getAuthorRowIndex = async (uuid: string): Promise<number | null> => {
	// This is a little cursed, but to query the authors, we write a formula in a hidden cell that does the query
	// The Sheets response is the new value at the cell, which should be the result of the query
	const update = await Sheets.updateRowInSheet(SPREADSHEET_ID, Sheets.createRange(QUERY_SHEET, "A1"), [
		[`=MATCH("${uuid}", ${Sheets.createRange(AUTHOR_SHEET, Columns.UUID, Columns.UUID)}, 0)`],
	]);
	const [[rowIndexString]] = update?.updatedData?.values ?? [];
	const rowIndex = Number(rowIndexString);
	return isFinite(rowIndex) ? rowIndex : null;
};

const getAuthorRange = async (uuid: string): Promise<string> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	return rowIndex ? selectRow(rowIndex) : null;
};

const getAllAuthors = async (): Promise<AuthorRecord[]> => {
	const authorTagData = await Sheets.readRanges(SPREADSHEET_ID, [selectAll]);
	return transformReadSheetsData(authorTagData);
};

const writeAuthor = async ({uuid, name, tags}: AuthorRecord): Promise<AuthorRecord | null> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	const author = {uuid, name, tags: filterAuthorTags(tags)};
	if (rowIndex === null) {
		return createAuthor(author);
	} else {
		return updateAuthor(rowIndex, author);
	}
};

const createAuthor = async ({uuid, name, tags}: AuthorRecord): Promise<AuthorRecord | null> => {
	const appendRes = await Sheets.appendRowToSheet(SPREADSHEET_ID, selectAll, [[uuid, name, tags.join(", ")]]);
	return valueRangeToAuthors(appendRes?.updates?.updatedData)?.[0] ?? null;
};

const updateAuthor = async (rowIndex: number, {uuid, name, tags}: AuthorRecord): Promise<AuthorRecord | null> => {
	const range = Sheets.createRange(AUTHOR_SHEET, `${Columns.UUID}${rowIndex}`, `${Columns.TAGS}${rowIndex}`);
	const updateRes = await Sheets.updateRowInSheet(SPREADSHEET_ID, range, [[uuid, name, tags.join(", ")]]);
	return valueRangeToAuthors(updateRes?.updatedData)?.[0] ?? null;
};

const valueRangeToAuthors = (valueRange: ValueRange): AuthorRecord[] =>
	valueRange?.values.map((value) => {
		const [uuid, name, tagString] = value;
		const sheetTags = tagString?.split(",") ?? [];
		return setCache(uuid, {uuid, name, tags: filterAuthorTags(sheetTags)});
	}) ?? [];

const transformReadSheetsData = (authorTagsData: GetSheetsDataResponse): AuthorRecord[] | null => {
	return authorTagsData?.valueRanges.flatMap(valueRangeToAuthors) ?? null;
};

const getAuthor = async (uuid: string): Promise<AuthorRecord> => {
	return asyncCached(uuid, async () => {
		const range = await getAuthorRange(uuid);
		if (range !== null) {
			const author = await Sheets.readRanges(SPREADSHEET_ID, [range]);
			return transformReadSheetsData(author)?.[0] ?? null;
		}
		return null;
	});
};

export type {AuthorRecord};
export default {getAllAuthors, writeAuthor, getAuthor};
