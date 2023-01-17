import {RawTagSheet} from "../types";
import Sheets, {Values} from "../../sheets";
import {getSheetId} from "../../../../common/entities/spreadsheet";
import {getFormatStrategy} from "./formats";

/**
 * The Meta Tag Sheet stores information about where tags are in the spreadsheet
 * The format of the Meta Tag Sheet is dependent on the formatting version
 * Format version is decided by the use of the #format keyword in the first row
 * of The Meta Tag Sheet.
 *
 * #format will always be in the first row of the Meta Tag Sheet. This can never change.
 */
const META_TAG_SHEET = "Tag Index Index";

const getMetaTagSheet = async (): Promise<Values> => {
	const range = Sheets.createRange(META_TAG_SHEET);
	const response = await Sheets.readRange(await getSheetId(), range);
	return response?.values ?? [];
};

const getSheetsTags = async (): Promise<RawTagSheet[]> => {
	const metaSheet = await getMetaTagSheet();
	const formatStrategy = getFormatStrategy(metaSheet);
	return formatStrategy(metaSheet);
};

export {getSheetsTags};
