import {Finder, FinderParameters, FinderResponse} from "../finder";

const bOK: Finder = async ({author, title}: FinderParameters): Promise<FinderResponse> => {
	// console.log(await get("https://b-ok.cc/s/foo%20bar"));
	console.log("bok");
	return ["bok"];
};

export {bOK};
