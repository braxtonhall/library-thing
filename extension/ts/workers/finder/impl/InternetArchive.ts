import {Finder, FinderParameters, FinderResponse} from "../finder";

const InternetArchive: Finder = async ({author, title}: FinderParameters): Promise<FinderResponse> => {
	console.log("internet archive");
	return ["internet archive"];
};

export {InternetArchive};
