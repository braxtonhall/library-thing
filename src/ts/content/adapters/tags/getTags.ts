import {makeCache} from "../../../common/util/cache";
import {TagSearchOptions, TagTrees} from "./types";
import Sheets, {Range, ValueRange} from "../sheets";
import {parseTree} from "./parseTags";
import {incrementColumnBy} from "../sheets/util";

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin

type TagMapper = `${string}$TAG${string}`;
type MappedRange = {range: Range; mapper: TagMapper};

const META_TAG_SHEET = "Tag Index Index";
/**
 * The Meta Tag Sheet stores information about where tags are in the spreadsheet
 * Each row is of the form
 *   | SHEET | TOP_LEFT | WIDTH | MAPPER? | AS? |
 * where
 * SHEET    is the name of a sheet in the spreadsheet where tags live
 * TOP_LEFT is the top left most cell in the sheet the contains a tag
 * WIDTH    is how many columns contain tags
 * MAPPER   is how tags should be mapped to after being consumed by BLT
 * AS       is how the (possibly artificial) sheet should be named by BLT
 *
 * Example:
 *   | Identity | A2 | 2 |
 * In the sheet "Identity" there is a table of width 2 storing tags.
 *    The first tag in this table is at A2
 */

const {asyncCached, setCache} = makeCache<TagTrees>();

const rowIsRange = ([, topLeft, width]: string[]): boolean =>
	topLeft && width && /^[A-Z]+[0-9]+$/.test(topLeft) && /^[0-9]+$/.test(width);

const rowToMappedRange = ([sheet, topLeft, width, userMapper]: string[]): MappedRange => {
	// `left` is a column, for example "B"
	const left = topLeft.match(/^[A-Z]+/)[0];
	// `right` is the right most column with tags if there are `width` columns of tags
	// for example, `left` = "B", `width` = 2, `right` = "C"
	const right = incrementColumnBy(left, Number(width) - 1);
	const range: Range = `${sheet}!${topLeft}:${right}`;
	const mapper: TagMapper = (userMapper ?? "").includes("$TAG") ? (userMapper as TagMapper) : "$TAG";
	return {range, mapper};
};

const getTagRanges = async (): Promise<MappedRange[]> => {
	const range = Sheets.createRange(META_TAG_SHEET, "A", "E");
	const response = await Sheets.readRanges(SPREADSHEET_ID, [range]);
	return response?.[0].values.filter(rowIsRange).map(rowToMappedRange) ?? [];
};

const getSheetsTags = async (): Promise<string[][]> => {
	const mappedRanges = await getTagRanges();
	const ranges = mappedRanges.map(({range}) => range);
	const response = await Sheets.readRanges(SPREADSHEET_ID, ranges);
	return response?.flatMap((valueRange, index) => mapTags(valueRange, mappedRanges[index].mapper)) ?? [];
};

const mapTags = (valueRange: ValueRange, mapper: TagMapper): string[][] => {
	const values = valueRange.values ?? [];
	return values.map((row) => row.map((value) => mapper.replaceAll("$TAG", value)));
};

const getTagTrees = async ({noCache}: TagSearchOptions = {noCache: false}) => {
	const implementation = async () => parseTree(await getSheetsTags());
	if (noCache) {
		return implementation().then((tree) => setCache("", tree));
	} else {
		return asyncCached("", implementation);
	}
};

export {getTagTrees};
