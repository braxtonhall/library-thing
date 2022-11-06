import {Finder, FinderParameters} from "../finder";
import {sleep} from "../../../../common/util/sleep";

const SEARCH_TIMEOUT_MS = 10_000;

const timeout = (): Promise<never> =>
	sleep(SEARCH_TIMEOUT_MS).then(() => {
		throw new Error("Timeout reached!");
	});

const timed =
	<T>(finder: Finder<T>): Finder<T> =>
	(parameters: FinderParameters): Promise<T> =>
		Promise.race([finder(parameters), timeout()]);

const handleRejection =
	<T>(defaultValue: T) =>
	(finder: Finder<T>): Finder<T> =>
	(parameters: FinderParameters) =>
		finder(parameters).catch((error) => {
			console.error(error);
			return defaultValue;
		});

const commonFinder =
	<T>(finders: Finder<T>[], defaultValue: T) =>
	async (parameters: FinderParameters): Promise<T[]> =>
		Promise.all(
			finders
				.map(timed)
				.map(handleRejection(defaultValue))
				.map((finder: Finder<T>) => finder(parameters))
		);

export {commonFinder};
