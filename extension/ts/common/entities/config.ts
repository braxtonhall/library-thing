import storage from "../adapters/storage";

enum ConfigKey {
	CheckVersionInterval = "check-version-interval",
}

const ONE_DAY_MS = 86400000;

const configDefaults = {
	[ConfigKey.CheckVersionInterval]: ONE_DAY_MS,
};

const get = async <K extends ConfigKey>(key: K): Promise<typeof configDefaults[K]> =>
	storage.get<typeof configDefaults[K]>(key, configDefaults[key]);

const set: <K extends ConfigKey>(key: K, value: typeof configDefaults[K]) => Promise<typeof configDefaults[K]> =
	storage.set;

export {ConfigKey};
export default {get, set};
