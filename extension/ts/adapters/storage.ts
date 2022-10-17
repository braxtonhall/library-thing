import {makeCache} from "../util/cache";

const {asyncCached, setCache} = makeCache<any>();

const set = async <T>(key: string, value: T): Promise<T> => {
	setCache(key, value);
	await chrome.storage.sync.set({[key]: value});
	return value;
};

const get = <T>(key: string): Promise<T> => {
	return asyncCached(key, async () => {
		const storage = await chrome.storage.sync.get({[key]: ""});
		return storage[key];
	});
};

export default {get, set};
