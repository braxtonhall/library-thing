import Sheets, {Range, ValueRange, Values} from "../../../../sheets";
import {RawTagSheet, TagMapper, TagSheetDescriptor, WarnedTag} from "../../../types";
import {FormatStrategy} from "../index";
import {getSheetId} from "../../../../../../common/entities/spreadsheet";
import {incrementColumnBy} from "../../../../sheets/util";

/**
 * RE: Version "aaliyah"
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

const rowIsRange = ([, topLeft, width]: string[]): boolean =>
	topLeft && width && /^[A-Z]+[0-9]+$/.test(topLeft) && /^[0-9]+$/.test(width);

const rowToSheetDescriptor = ([sheet, topLeft, width, cwColumn, userMapper, as]: string[]): TagSheetDescriptor => {
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
	return {range, mapper, cwRange, height: Number(width), name: as ?? sheet};
};

const getSheetDescriptors = (metaSheet: Values): TagSheetDescriptor[] =>
	metaSheet?.filter(rowIsRange).map(rowToSheetDescriptor) ?? [];

const extractRanges = (ranges: TagSheetDescriptor[]): Set<Range> =>
	ranges.reduce(
		(acc, {cwRange, range}) => (cwRange ? acc.add(cwRange).add(range) : acc.add(range)),
		new Set<Range>()
	);

const nameResponses = (ranges: Range[], response: ValueRange[] | null): Map<Range, Values> => {
	const groupedResponses = new Map();
	response?.forEach((valueRange, index) => groupedResponses.set(ranges[index], valueRange?.values));
	return groupedResponses;
};

const annotateWithContentWarnings = (tags: string[][], contentWarnings: Values | undefined): WarnedTag[][] =>
	tags.map((row, rowIndex) =>
		row.map((cell) => ({tag: cell.trim(), warning: !!contentWarnings?.values?.[rowIndex]?.[0]}))
	);

const toTagSheet =
	(namedResponses: Map<Range, Values>) =>
	(descriptor: TagSheetDescriptor): RawTagSheet => {
		const tags = namedResponses.get(descriptor.range);
		const mappedTags = mapTags(tags, descriptor.mapper);
		const contentWarnings = namedResponses.get(descriptor.cwRange);
		const values = annotateWithContentWarnings(mappedTags, contentWarnings);
		return {...descriptor, values};
	};

const mapTags = (values: Values | undefined, mapper: TagMapper): string[][] => {
	return values?.map((row) => row.map((value) => mapper.replaceAll("$TAG", value))) ?? [];
};

const aaliyah: FormatStrategy = async (metaSheet: Values): Promise<RawTagSheet[]> => {
	const mappedRanges = getSheetDescriptors(metaSheet);
	const ranges = [...extractRanges(mappedRanges)]; // We might have duplicate ranges, so we use a set when extracting
	const response = await Sheets.readRanges(await getSheetId(), ranges);
	const namedResponses = nameResponses(ranges, response);
	return mappedRanges.map(toTagSheet(namedResponses));
};

// TODO if aaliyah ever gets deprecated, it should also warn the user somehow that the Tag Index is out of date

export {aaliyah};
