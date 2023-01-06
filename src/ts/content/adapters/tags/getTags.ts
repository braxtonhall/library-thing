import {makeCache} from "../../../common/util/cache";
import {TagSearchOptions, TagTrees, WarnedTag} from "./types";
import Sheets, {Range, ValueRange} from "../sheets";
import {parseTree} from "./parseTags";
import {incrementColumnBy} from "../sheets/util";
import {getSheetId} from "../../../common/entities/spreadsheet";

type TagMapper = `${string}$TAG${string}`;
type MappedRange = {range: Range; mapper: TagMapper; name: string; cwRange?: Range};

const META_TAG_SHEET = "Tag Index Index";
/**
 * The Meta Tag Sheet stores information about where tags are in the spreadsheet
 * Each row is of the form
 *   | SHEET | TOP_LEFT | WIDTH | CW_COL? | MAPPER? | AS? |
 * where
 * SHEET    is the name of a sheet in the spreadsheet where tags live
 * TOP_LEFT is the top left most cell in the sheet the contains a tag
 * WIDTH    is how many columns contain tags
 * MAPPER   is how tags should be mapped to after being consumed by BLT
 *           mapped tags only exist dynamically in BLT
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

const rowToMappedRange = ([sheet, topLeft, width, cwColumn, userMapper, as]: string[]): MappedRange => {
	// `left` is a column, for example "B"
	const left = topLeft.match(/^[A-Z]+/)[0];
	// `top` is a row, for example "4"
	const top = topLeft.match(/[0-9]+$/)[0];
	// `right` is the right most column with tags if there are `width` columns of tags
	// for example, `left` = "B", `width` = 2, `right` = "C"
	const right = incrementColumnBy(left, Number(width) - 1);
	const range: Range = `${sheet}!${topLeft}:${right}`;
	const cwRange: Range = cwColumn ? `${sheet}!${cwColumn}${top}:${cwColumn}` : undefined;
	const mapper: TagMapper = (userMapper ?? "").includes("$TAG") ? (userMapper as TagMapper) : "$TAG";
	return {range, mapper, cwRange, name: as ?? sheet};
};

const getTagRanges = async (): Promise<MappedRange[]> => {
	const range = Sheets.createRange(META_TAG_SHEET, "A", "E");
	const response = await Sheets.readRanges(await getSheetId(), [range]);
	return response?.[0].values.filter(rowIsRange).map(rowToMappedRange) ?? [];
};

const extractRanges = (ranges: MappedRange[]): Set<Range> =>
	ranges.reduce(
		(acc, {cwRange, range}) => (cwRange ? acc.add(cwRange).add(range) : acc.add(range)),
		new Set<Range>()
	);

const nameResponses = (ranges: Range[], response: ValueRange[] | null): Map<Range, ValueRange> => {
	const groupedResponses = new Map();
	response?.forEach((valueRange, index) => groupedResponses.set(ranges[index], valueRange));
	return groupedResponses;
};

const annotateWithContentWarnings = (tags: string[][], contentWarnings: ValueRange | undefined): WarnedTag[][] =>
	tags.map((row, rowIndex) => row.map((cell) => ({tag: cell, warning: !!contentWarnings?.values?.[rowIndex]?.[0]})));

const toWarningTags = (namedResponses: Map<Range, ValueRange>) => (mappedRange: MappedRange) => {
	const tags = namedResponses.get(mappedRange.range);
	const mappedTags = mapTags(tags, mappedRange.mapper);
	const contentWarnings = namedResponses.get(mappedRange.cwRange);
	return annotateWithContentWarnings(mappedTags, contentWarnings);
};

const getSheetsTags = async (): Promise<WarnedTag[][]> => {
	const mappedRanges = await getTagRanges();
	const ranges = [...extractRanges(mappedRanges)]; // We might have duplicate ranges, so we use a set when extracting
	const response = await Sheets.readRanges(await getSheetId(), [...ranges]);
	const namedResponses = nameResponses(ranges, response);
	return mappedRanges.flatMap(toWarningTags(namedResponses));
};

const mapTags = (valueRange: ValueRange | undefined, mapper: TagMapper): string[][] => {
	const values = valueRange?.values ?? [];
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
