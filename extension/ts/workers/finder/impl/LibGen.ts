import {Finder, FinderParameters, FinderResponse} from "../finder";

const LibGen: Finder = async ({author, title}: FinderParameters): Promise<FinderResponse> => {
	// console.log(await get("https://libgen.is/search.php?req=foo&open=0&res=25&view=simple&phrase=1&column=def"));
	console.log("libgen");
	return ["libgen"];
};

export {LibGen};
