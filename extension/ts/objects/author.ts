import Sheets, {GetSheetsDataResponse} from "./sheets";

const SPREADSHEET_ID = "18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU";
const AUTHOR_SHEET = "Author";
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

const getAuthorRowIndex = async (uuid: string): Promise<number | null> => {
	// This is a little cursed, but to query the authors, we write a formula in a hidden cell that does the query
	// The Sheets response is the new value at the cell, which should be the result of the query
	const update = await Sheets.updateRowInSheet(SPREADSHEET_ID, Sheets.createRange(QUERY_SHEET, "A1"), [
		[`=MATCH("${uuid}", ${Sheets.createRange(AUTHOR_SHEET, UUID_COLUMN)}, 0)`],
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

const writeAuthor = async ({uuid, name, tags}: Author): Promise<number | null> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	if (rowIndex === null) {
		return createAuthor({uuid, name, tags});
	} else {
		return updateAuthor(rowIndex, name, tags);
	}
};

const createAuthor = async ({uuid, name, tags}: Author): Promise<number | null> => {
	const appendRes = await Sheets.appendRowToSheet(SPREADSHEET_ID, selectAll, [[uuid, name, tags.join(", ")]]);
	return appendRes?.updates?.updatedRows ?? null;
};

const updateAuthor = async (rowIndex: number, name: string, tags: string[]): Promise<number | null> => {
	const range = Sheets.createRange(AUTHOR_SHEET, `${NAME_COLUMN}${rowIndex}`, `${TAGS_COLUMN}${rowIndex}`);
	const updateRes = await Sheets.updateRowInSheet(SPREADSHEET_ID, range, [[name, tags.join(", ")]]);
	return updateRes?.updatedRows ?? null;
};

const transformReadSheetsData = (authorTagsData: GetSheetsDataResponse): Author[] | null => {
	return (
		authorTagsData?.valueRanges.flatMap(
			(valueRange) =>
				valueRange?.values.map((value) => {
					const [uuid, name, tags] = value;
					return {uuid, name, tags: tags?.split(",").map((tag) => tag.trim()) ?? []};
				}) ?? []
		) ?? null
	);
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
