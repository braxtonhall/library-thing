/**
 * Caching is used to prevent duplicate web-request during a single page visit
 *
 * For example, when pulling authors for a set of books, if the author is on multiple books,
 * the cache reduces that to a single request :)
 */

const LOCK = {}; // Nothing else in the system will ever === this

const makeCache = <T>() => {
	const cache = new Map<string, T>();

	const _yield = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

	const pollForBook = async (id: string): Promise<T> => {
		const value = cache.get(id);
		if (value === LOCK) {
			// If the value is LOCK, then someone else is already working on the request.
			// We should yield and then try again
			await _yield();
			return pollForBook(id);
		} else {
			return value;
		}
	};

	const syncCached = (id: string, implementation: () => T): T => {
		// Sync calls have no way to yield if "locked" so we just override
		// Technically this means double computation but oh well
		if (!cache.has(id) || cache.get(id) === LOCK) {
			cache.set(id, implementation());
		}
		return cache.get(id);
	};

	const asyncCached = async (id: string, implementation: () => Promise<T>): Promise<T> => {
		if (!cache.has(id)) {
			cache.set(id, LOCK as T); // Lock for other async calls!
			const newValue = await implementation();
			// Must check for lock in case Sync/Set cache
			if (cache.get(id) === LOCK) {
				cache.set(id, newValue); // Unlock other async calls!
			}
			return cache.get(id);
		} else {
			return pollForBook(id);
		}
	};

	const setCache = (id: string, value: T): T => {
		// Set cache calls have no way to yield if "locked" so we just override
		cache.set(id, value);
		return value;
	};

	return {syncCached, asyncCached, setCache};
};

export {makeCache};
