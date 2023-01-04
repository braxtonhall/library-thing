import storage from "../adapters/storage";
import {FormData} from "../../content/entities/bookForm";

/**
 * The point is this file is to have storage,
 * but with types consistent across different files
 * also accessing the same configs
 */

enum ConfigKey {
	FormData = "form-data",
	CheckVersionInterval = "check-version-interval",
}

const ONE_DAY_MS = 86400000;

type ConfigDefaults = {
	[ConfigKey.FormData]: FormData;
	[ConfigKey.CheckVersionInterval]: number;
};

const configDefaults: ConfigDefaults = {
	[ConfigKey.FormData]: {},
	[ConfigKey.CheckVersionInterval]: ONE_DAY_MS,
};

type ConfigGetter = <K extends ConfigKey>(key: K) => Promise<ConfigDefaults[K]>;
type ConfigSetter = <K extends ConfigKey>(key: K, value: ConfigDefaults[K]) => Promise<ConfigDefaults[K]>;

const get: ConfigGetter = (key) => storage.get(key, configDefaults[key]);
const set: ConfigSetter = storage.set;

export {ConfigKey};
export default {get, set};
