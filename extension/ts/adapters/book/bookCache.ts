import {BookRecord} from "./types";

const cache = new Map<string, BookRecord>();

const _yield = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const pollForBook = async (id: string): Promise<BookRecord> => {
	const value = cache.get(id);
	if (value === null) {
		await _yield();
		return pollForBook(id);
	} else {
		return value;
	}
};

const syncCached = (id: string, implementation: () => BookRecord): BookRecord => {
	if (!cache.get(id)) {
		cache.set(id, implementation());
	}
	return cache.get(id);
};

const asyncCached = async (id: string, implementation: () => Promise<BookRecord>): Promise<BookRecord> => {
	if (!cache.has(id)) {
		cache.set(id, null); // Lock!
		const newValue = await implementation();
		cache.set(id, newValue);
		return newValue;
	} else {
		return pollForBook(id);
	}
};

export {syncCached, asyncCached};
