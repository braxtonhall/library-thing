/**
 * This file works across background and foreground threads. Consider migrating all storage to this
 */

const set = async <T>(key: string, value: T): Promise<T> => {
	await chrome.storage.sync.set({[key]: value});
	return value;
};

const get = async <T>(key: string, defaultValue?: T): Promise<T> => {
	const storage = await chrome.storage.sync.get({[key]: defaultValue});
	return storage[key];
};

export default {get, set};
