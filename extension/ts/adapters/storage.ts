import {makeCache} from "../util/cache";

/**
 * This file works across background and foreground threads. Consider migrating all storage to this
 */

const {asyncCached, setCache} = makeCache<any>();

const set = async <T>(key: string, value: T): Promise<T> => {
	const update = {[key]: setCache(key, value)};
	await chrome.storage.sync.set(update);
	return value;
};

const get = <T>(key: string): Promise<T> => {
	return asyncCached(key, async () => {
		const storage = await chrome.storage.sync.get({[key]: ""});
		return storage[key];
	});
};

export default {get, set};
