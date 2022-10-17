const makeCache = <T>() => {
	const cache = new Map<string, T>();

	const _yield = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

	const pollForBook = async (id: string): Promise<T> => {
		const value = cache.get(id);
		if (value === null) {
			await _yield();
			return pollForBook(id);
		} else {
			return value;
		}
	};

	const syncCached = (id: string, implementation: () => T): T => {
		if (!cache.get(id)) {
			cache.set(id, implementation());
		}
		return cache.get(id);
	};

	const asyncCached = async (id: string, implementation: () => Promise<T>): Promise<T> => {
		if (!cache.has(id)) {
			cache.set(id, null); // Lock!
			const newValue = await implementation();
			cache.set(id, newValue);
			return newValue;
		} else {
			return pollForBook(id);
		}
	};

	const setCache = (id: string, value: T): void => {
		cache.set(id, value);
	};

	return {syncCached, asyncCached, setCache};
};

export {makeCache};
