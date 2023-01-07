import storage from "../adapters/storage";
import {FormData} from "../../content/entities/bookForm";
import {SizeData} from "../../content/extensions/resize";

/**
 * The point is this file is to have storage,
 * but with types consistent across different files
 * also accessing the same configs
 */

enum ConfigKey {
	SpreadsheetLink = "spreadsheet-link",
	SizeData = "size-data",
	LatestRender = "last-render",
	FormData = "form-data",
	EnforceAuthAndTagIndex = "enforce-auth-tag-index",
}

type ConfigDefaults = {
	[ConfigKey.SpreadsheetLink]: string;
	[ConfigKey.SizeData]: SizeData;
	[ConfigKey.LatestRender]: number;
	[ConfigKey.FormData]: FormData;
	[ConfigKey.EnforceAuthAndTagIndex]: boolean;
};

const configDefaults: ConfigDefaults = {
	[ConfigKey.SpreadsheetLink]: "",
	[ConfigKey.SizeData]: {},
	[ConfigKey.LatestRender]: 0,
	[ConfigKey.FormData]: {},
	[ConfigKey.EnforceAuthAndTagIndex]: true,
};

type ConfigGetter = <K extends ConfigKey>(key: K) => Promise<ConfigDefaults[K]>;
type ConfigSetter = <K extends ConfigKey>(key: K, value: ConfigDefaults[K]) => Promise<ConfigDefaults[K]>;

const get: ConfigGetter = (key) => storage.get(key, configDefaults[key]);
const set: ConfigSetter = storage.set;

export {ConfigKey};
export default {get, set};
