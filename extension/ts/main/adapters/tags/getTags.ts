import {makeCache} from "../../util/cache";
import {TagSearchOptions, TagTree} from "./types";
import Sheets from "../sheets";
import {parseTree} from "./parseTags";
import {incrementColumnBy} from "../sheets/util";

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin

const META_TAG_SHEET = "Tag Index Index";
/**
 * The Meta Tag Sheet stores information about where tags are in the spreadsheet
 * Each row is of the form
 *   | SHEET | TOP_LEFT | WIDTH |
 * where
 * SHEET    is the name of a sheet in the spreadsheet where tags live
 * TOP_LEFT is the top left most cell in the sheet the contains a tag
 * WIDTH    is how many columns contain tags
 *
 * Example:
 *   | Identity | A2 | 2 |
 * In the sheet "Identity" there is a table of width 2 storing tags.
 *    The first tag in this table is at A2
 */

const {asyncCached, setCache} = makeCache<TagTree>();

const rowIsRange = ([, topLeft, width]: string[]): boolean =>
	topLeft && width && /^[A-Z]+[0-9]+$/.test(topLeft) && /^[0-9]+$/.test(width);

const rowToRange = ([sheet, topLeft, width]: string[]): string => {
	// `left` is a column, for example "B"
	const left = topLeft.match(/^[A-Z]+/)[0];
	// `right` is the right most column with tags if there are `width` columns of tags
	// for example, `left` = "B", `width` = 2, `right` = "C"
	const right = incrementColumnBy(left, Number(width) - 1);
	return `${sheet}!${topLeft}:${right}`;
};

const getTagRanges = async (): Promise<string[]> => {
	const range = Sheets.createRange(META_TAG_SHEET, "A", "C");
	const response = await Sheets.readRanges(SPREADSHEET_ID, [range]);
	return response?.valueRanges?.[0].values.filter(rowIsRange).map(rowToRange) ?? [];
};

const getSheetsTags = async (): Promise<string[][]> => {
	const ranges = await getTagRanges();
	const response = await Sheets.readRanges(SPREADSHEET_ID, ranges);
	return response?.valueRanges?.flatMap((valueRange) => valueRange.values ?? []) ?? [];
};

const getTagTree = async ({noCache}: TagSearchOptions = {noCache: false}) => {
	const implementation = async () => parseTree(await getSheetsTags());
	if (noCache) {
		return implementation().then((tree) => setCache("", tree));
	} else {
		return asyncCached("", implementation);
	}
};

export {getTagTree};
