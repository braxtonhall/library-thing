import Sheets, {GetSheetsDataResponse} from "./sheets";

const SPREADSHEET_ID = "18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU";

interface AuthorTag {
	uuid: string;
	name: string;
	tags: string[];
	sheetsCellIndex?: string;
}

const authorRange = (from: string, to: string) => `Authors!${from}:${to}`;

const getAllAuthorTags = async (): Promise<AuthorTag[]> => {
	const authorTagData = await Sheets.readRanges(SPREADSHEET_ID, [authorRange("A", "C")]);
	return authorTagData ? transformReadSheetsData(authorTagData) : null;
};

const getAuthorTagsByUUID = async (uuid: string): Promise<AuthorTag | null> => {
	const allAuthorTags = await getAllAuthorTags();
	const authorTagByUUID = allAuthorTags.find((authorTag) => authorTag.uuid === uuid);
	return authorTagByUUID ?? null;
};

const createNewAuthorWithTags = async (uuid: string, name: string, tags: string[]): Promise<number | null> => {
	const authorTag = {uuid, name, tags};
	const appendRes = await Sheets.appendRowToSheet(SPREADSHEET_ID, authorRange("A", "C"), [
		[authorTag.uuid, authorTag.name, authorTag.tags.join(", ")],
	]);
	return appendRes?.updates?.updatedRows ?? null;
};

const updateAuthorTags = async (uuid: string, tags: string[]): Promise<number | null> => {
	const authorTag = await getAuthorTagsByUUID(uuid);
	if (authorTag && authorTag.sheetsCellIndex) {
		authorTag.tags = tags; // update tags
		const updateRes = await Sheets.updateRowInSheet(SPREADSHEET_ID, authorTag.sheetsCellIndex, [
			[authorTag.uuid, authorTag.name, authorTag.tags.join(", ")],
		]);
		return updateRes?.updatedRows ?? null;
	}
	return null;
};

const transformReadSheetsData = (authorTagsData: GetSheetsDataResponse): AuthorTag[] => {
	return authorTagsData.valueRanges.flatMap((valueRange) =>
		valueRange.values.map((value, i) => ({
			uuid: value[0],
			name: value[1],
			tags: value[2]?.split(",").map((tag) => tag.trim()) ?? [],
			sheetsCellIndex: authorRange( `A${i + 1}`, `C${i + 1}`), // cells use 1-based-indexing
		})));
};

const getAuthor = async (uuid: string) => {
	const update = await Sheets.updateRowInSheet(SPREADSHEET_ID, "LOOKUP!A1", [[`=MATCH("${uuid}", ${authorRange("A", "A")}, 0)`]]);
	const [rowIndex] = update?.updatedData?.values ?? [];
	const range = authorRange(`A${rowIndex}`, `C${rowIndex}`);
	const author = await Sheets.readRanges(SPREADSHEET_ID, [range]);
	return author ? transformReadSheetsData(author) : null;
};

export default {getAllAuthorTags, getAuthorTagsByUUID, createNewAuthorWithTags, updateAuthorTags, getAuthor};
