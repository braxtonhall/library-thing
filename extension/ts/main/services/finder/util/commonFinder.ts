import {Finder, FinderParameters} from "../finder";

const commonFinder =
	<T>(finders: Finder<T>[], defaultValue: T) =>
	async (parameters: FinderParameters): Promise<T[]> =>
		Promise.all(
			finders.map((finder: Finder<T>) =>
				finder(parameters).catch((error) => {
					console.error(error);
					return defaultValue;
				})
			)
		);

export {commonFinder};
