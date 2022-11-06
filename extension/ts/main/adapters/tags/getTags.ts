import {makeCache} from "../../util/cache";
import {TagSearchOptions, TagTree} from "./types";
import Sheets from "../sheets";
import {parseTree} from "./parseTags";
import {incrementColumnBy} from "./util";

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin

const META_TAG_SHEET = "Tag Index Index";

const {asyncCached, setCache} = makeCache<TagTree>();

const rowIsRange = ([, topLeft, width]: string[]): boolean =>
	topLeft && width && /^[A-Z]+[0-9]+$/.test(topLeft) && /^[0-9]+$/.test(width);

const rowToRange = ([sheet, topLeft, width]: string[]): string => {
	const left = topLeft.match(/^[A-Z]+/)[0];
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
