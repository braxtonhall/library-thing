import storage from "../adapters/storage";

/**
 * The point is this file is to have storage,
 * but with types consistent across different files
 * also accessing the same configs
 */

enum ConfigKey {}

const configDefaults = {};

type ConfigGetter = <K extends ConfigKey>(key: K) => Promise<typeof configDefaults[K]>;
type ConfigSetter = <K extends ConfigKey>(key: K, value: typeof configDefaults[K]) => Promise<typeof configDefaults[K]>;

const get: ConfigGetter = (key) => storage.get(key, configDefaults[key]);
const set: ConfigSetter = storage.set;

export {ConfigKey};
export default {get, set};
