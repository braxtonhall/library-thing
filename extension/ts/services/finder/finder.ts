import {bOK} from "./impl/bOK";
import {LibGen} from "./impl/LibGen";
import {InternetArchive} from "./impl/InternetArchive";

interface FinderParameters {
	author: string;
	title: string;
}

type FinderResponse = string[];

type Finder = ({author, title}: FinderParameters) => Promise<FinderResponse>;

const finders: Finder[] = [bOK, LibGen, InternetArchive];

const find: Finder = async (parameters: FinderParameters): Promise<FinderResponse> =>
	Promise.all(finders.map((finder: Finder) => finder(parameters))).then((result: string[][]) => result.flat());

export {FinderParameters, FinderResponse, Finder, find};
