import Sheets, {GetSheetsDataResponse, ValueRange} from "./sheets";

const SPREADSHEET_ID = "18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU";
const AUTHOR_SHEET = "Authors";
const QUERY_SHEET = "LOOKUP";

/**
 * These are the columns as stored in the Google Sheet
 * INVARIANT: UUID is just left of NAME is just left of TAGS
 *            Much of the code in this file assumes this order
 *            And that they are neighbours
 */
const UUID_COLUMN = "A";
const NAME_COLUMN = "B";
const TAGS_COLUMN = "C";

type Tags = string[];

interface Author {
	uuid: string;
	name: string;
	tags: Tags;
}

const selectAll = Sheets.createRange(AUTHOR_SHEET, UUID_COLUMN, TAGS_COLUMN);
const selectRow = (row: number) => Sheets.createRange(AUTHOR_SHEET, `${UUID_COLUMN}${row}`, `${TAGS_COLUMN}${row}`);

/**
 * Used to enforce following invariants:
 * 1. that all author tags have the word "author" at the end
 * 2. that there are no duplicates
 * 3. tags have no excessive whitespace
 */
const filterTags = (tags: string[]) => {
	const authorTags = tags.filter((tag) => tag.toLowerCase().endsWith("author"));
	const trimmedTags = authorTags.map((tag) => tag.trim());
	return [...new Set(trimmedTags)];
};

const getAuthorRowIndex = async (uuid: string): Promise<number | null> => {
	// This is a little cursed, but to query the authors, we write a formula in a hidden cell that does the query
	// The Sheets response is the new value at the cell, which should be the result of the query
	const update = await Sheets.updateRowInSheet(SPREADSHEET_ID, Sheets.createRange(QUERY_SHEET, "A1"), [
		[`=MATCH("${uuid}", ${Sheets.createRange(AUTHOR_SHEET, UUID_COLUMN, UUID_COLUMN)}, 0)`],
	]);
	const [[rowIndexString]] = update?.updatedData?.values ?? [];
	const rowIndex = Number(rowIndexString);
	return isFinite(rowIndex) ? rowIndex : null;
};

const getAuthorRange = async (uuid: string): Promise<string> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	return rowIndex ? selectRow(rowIndex) : null;
};

const getAllAuthors = async (): Promise<Author[]> => {
	const authorTagData = await Sheets.readRanges(SPREADSHEET_ID, [selectAll]);
	return transformReadSheetsData(authorTagData);
};

const writeAuthor = async ({uuid, name, tags}: Author): Promise<Author | null> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	const author = {uuid, name, tags: filterTags(tags)};
	if (rowIndex === null) {
		return createAuthor(author);
	} else {
		return updateAuthor(rowIndex, author);
	}
};

const createAuthor = async ({uuid, name, tags}: Author): Promise<Author | null> => {
	const appendRes = await Sheets.appendRowToSheet(SPREADSHEET_ID, selectAll, [[uuid, name, tags.join(", ")]]);
	return valueRangeToAuthors(appendRes?.updates?.updatedData)?.[0] ?? null;
};

const updateAuthor = async (rowIndex: number, {uuid, name, tags}: Author): Promise<Author | null> => {
	const range = Sheets.createRange(AUTHOR_SHEET, `${UUID_COLUMN}${rowIndex}`, `${TAGS_COLUMN}${rowIndex}`);
	const updateRes = await Sheets.updateRowInSheet(SPREADSHEET_ID, range, [[uuid, name, tags.join(", ")]]);
	return valueRangeToAuthors(updateRes?.updatedData)?.[0] ?? null;
};

const valueRangeToAuthors = (valueRange: ValueRange): Author[] =>
	valueRange?.values.map((value) => {
		const [uuid, name, tagString] = value;
		const sheetTags = tagString?.split(",") ?? [];
		return {uuid, name, tags: filterTags(sheetTags)};
	}) ?? [];

const transformReadSheetsData = (authorTagsData: GetSheetsDataResponse): Author[] | null => {
	return authorTagsData?.valueRanges.flatMap(valueRangeToAuthors) ?? null;
};

const getAuthor = async (uuid: string): Promise<Author> => {
	const range = await getAuthorRange(uuid);
	if (range !== null) {
		const author = await Sheets.readRanges(SPREADSHEET_ID, [range]);
		return transformReadSheetsData(author)?.[0] ?? null;
	}
	return null;
};

export default {getAllAuthors, writeAuthor, getAuthor};
