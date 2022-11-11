import storage from "../adapters/storage";

enum ConfigKey {
	CheckVersionInterval = "check-version-interval",
}

const ONE_DAY_MS = 86400000;

const configDefaults = {
	[ConfigKey.CheckVersionInterval]: ONE_DAY_MS,
};

type ConfigGetter = <K extends ConfigKey>(key: K) => Promise<typeof configDefaults[K]>;
type ConfigSetter = <K extends ConfigKey>(key: K, value: typeof configDefaults[K]) => Promise<typeof configDefaults[K]>;

const get: ConfigGetter = (key) => storage.get(key, configDefaults[key]);
const set: ConfigSetter = storage.set;

export {ConfigKey};
export default {get, set};
