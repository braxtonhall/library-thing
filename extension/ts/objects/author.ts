import Sheets, {GetSheetsDataResponse} from "./sheets";

const SPREADSHEET_ID = "18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU";

interface AuthorTag {
	uuid: string;
	name: string;
	tags: string[];
	sheetsCellIndex?: string;
}

const getAllAuthorTags = async (): Promise<AuthorTag[]> => {
	const authorTagData = await Sheets.readAllRowsFromSheet(SPREADSHEET_ID, ["A:C"]);
	return authorTagData ? transformReadSheetsData(authorTagData) : null;
};

const getAuthorTagsByUUID = async (uuid: string): Promise<AuthorTag | null> => {
	const allAuthorTags = await getAllAuthorTags();
	const authorTagByUUID = allAuthorTags.find((authorTag) => authorTag.uuid === uuid);
	return authorTagByUUID ?? null;
};

const createNewAuthorWithTags = async (uuid: string, name: string, tags: string[]): Promise<number | null> => {
	const authorTag = {uuid, name, tags};
	const appendRes = await Sheets.appendRowToSheet(SPREADSHEET_ID, "A:C", [
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
	const authorTags: AuthorTag[] = [];
	for (const valueRange of authorTagsData.valueRanges) {
		// start at 1, skip title row
		for (let i = 1; i < valueRange.values.length; i++) {
			const value = valueRange.values[i];
			authorTags.push({
				uuid: value[0],
				name: value[1],
				tags: value[2]?.split(", ") ?? [""],
				sheetsCellIndex: `A${i + 1}:C${i + 1}`, // cells use 1-based-indexing
			});
		}
	}

	return authorTags;
};

export default {getAllAuthorTags, getAuthorTagsByUUID, createNewAuthorWithTags, updateAuthorTags};
