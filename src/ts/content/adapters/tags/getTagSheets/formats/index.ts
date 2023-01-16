import {FormatKeyword} from "../keywords";
import {Values} from "../../../sheets";
import {RawTagSheet} from "../../types";
import {aaliyah} from "./impl/aaliyah";
import {zhane} from "./impl/zhane";

type FormatStrategy = (metaTagSheet: Values) => Promise<RawTagSheet[]>;

enum FormatVersion {
	AALIYAH = "aaliyah",
	ZHANE = "zhane",
}

const DEFAULT_FORMAT_VERSION = FormatVersion.AALIYAH;
const UNKNOWN_FORMAT_VERSION = FormatVersion.ZHANE;

const getSheetsTagsStrategies: {[key in FormatVersion]: FormatStrategy} = {
	[FormatVersion.AALIYAH]: aaliyah,
	[FormatVersion.ZHANE]: zhane,
};

const toFormatVersion = (userFormatVersion: string): FormatVersion =>
	Object.values(FormatVersion).find((version) => version === userFormatVersion) ?? UNKNOWN_FORMAT_VERSION;

const getFormatVersion = (values: Values): FormatVersion => {
	const firstRow = values[0] ?? [];
	const formatKeywordIndex = firstRow.findIndex((cell) => cell.trim().toLowerCase() === FormatKeyword.FORMAT);
	const userFormatVersion = firstRow[formatKeywordIndex + 1]?.trim()?.toLowerCase();
	return toFormatVersion(userFormatVersion ?? DEFAULT_FORMAT_VERSION);
};

const getFormatStrategy = (values: Values): FormatStrategy => getSheetsTagsStrategies[getFormatVersion(values)];

export type {FormatStrategy};
export {getFormatStrategy};
