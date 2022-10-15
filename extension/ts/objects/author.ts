import Sheets, {GetSheetsDataResponse} from "./sheets";

const SPREADSHEET_ID = "18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU";

type Tags = string[];

interface AuthorRecord {
	uuid: string;
	name: string;
	tags: Tags;
}

const authorRange = (from: string, to: string) => `Authors!${from}:${to}`;

const getAuthorRowIndex = async (uuid: string): Promise<number | null> => {
	// TODO explain the black magic happening here
	const update = await Sheets.updateRowInSheet(SPREADSHEET_ID, "LOOKUP!A1", [
		[`=MATCH("${uuid}", ${authorRange("A", "A")}, 0)`],
	]);
	const [[rowIndexString]] = update?.updatedData?.values ?? [];
	const rowIndex = Number(rowIndexString);
	return isFinite(rowIndex) ? rowIndex : null;
};

const getAuthorRange = async (uuid: string): Promise<string> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	return rowIndex ? authorRange(`A${rowIndex}`, `C${rowIndex}`) : null;
};

const getAllAuthorTags = async (): Promise<AuthorRecord[]> => {
	const authorTagData = await Sheets.readRanges(SPREADSHEET_ID, [authorRange("A", "C")]);
	return transformReadSheetsData(authorTagData);
};

const getAuthorTagsByUUID = async (uuid: string): Promise<Tags | null> => {
	const author = await getAuthor(uuid);
	return author?.tags ?? [];
};

const createNewAuthorWithTags = async (uuid: string, name: string, tags: string[]): Promise<number | null> => {
	const authorTag = {uuid, name, tags};
	const appendRes = await Sheets.appendRowToSheet(SPREADSHEET_ID, authorRange("A", "C"), [
		[authorTag.uuid, authorTag.name, authorTag.tags.join(", ")],
	]);
	return appendRes?.updates?.updatedRows ?? null;
};

const updateAuthorTags = async (uuid: string, tags: string[]): Promise<number | null> => {
	const rowIndex = await getAuthorRowIndex(uuid);
	if (rowIndex !== null) {
		const range = authorRange(`C${rowIndex}`, `C${rowIndex}`);
		const updateRes = await Sheets.updateRowInSheet(SPREADSHEET_ID, range, [[tags.join(", ")]]);
		return updateRes?.updatedRows ?? null;
	}
	return null;
};

const transformReadSheetsData = (authorTagsData: GetSheetsDataResponse): AuthorRecord[] | null => {
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

const getAuthor = async (uuid: string): Promise<AuthorRecord> => {
	const range = await getAuthorRange(uuid);
	if (range !== null) {
		const author = await Sheets.readRanges(SPREADSHEET_ID, [range]);
		return transformReadSheetsData(author)?.[0] ?? null;
	}
	return null;
};

export default {getAllAuthorTags, getAuthorTagsByUUID, createNewAuthorWithTags, updateAuthorTags, getAuthor};
