const debounce = <T extends (...args: any[]) => void>(
	callback: T,
	wait: number,
	immediate?: boolean
): ((...args: Parameters<T>) => void) => {
	if (immediate) {
		return immediateDebounce(callback, wait);
	} else {
		return delayedDebounce(callback, wait);
	}
};

const delayedDebounce = <T extends (...args: any[]) => void>(
	callback: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: number;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			timeout = null;
			callback(...args);
		}, wait);
	};
};

const immediateDebounce = <T extends (...args: any[]) => any>(
	callback: T,
	wait: number
): ((...args: Parameters<T>) => void) => {
	let timeout: number;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => (timeout = null), wait);
		!timeout && callback(...args);
	};
};

export {debounce};
