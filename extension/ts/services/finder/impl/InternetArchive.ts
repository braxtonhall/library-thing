import {Finder, FinderResponse} from "../finder";
import {invokeWorker} from "../../../workers/invoker";
import {WorkerKind} from "../../../workers/types";

const MAX = 3;

const BASE_URL = "https://archive.org";
const SEARCH_PATH = "/advancedsearch.php";
const DETAILS_PATH = "/details";

const toLink = (response: any): string => {
	if (!!response && typeof response === "object" && "identifier" in response) {
		const {identifier} = response;
		return `${BASE_URL}${DETAILS_PATH}/${identifier}`;
	} else {
		return null;
	}

};

const getLinks = (responseString: string): string[] => {
	const response = JSON.parse(responseString).response;
	return response.docs.map(toLink).filter((link) => !!link);
};

const getURL = ({author, title}) => {
	const query = {q: `title:(${title}) AND creator:(${author})`, output: "json"};
	return `${BASE_URL}${SEARCH_PATH}?${new URLSearchParams(query).toString()}`;
};

const InternetArchive: Finder = async (parameters): Promise<FinderResponse> => {
	try {
		const response = await invokeWorker(WorkerKind.Get, getURL(parameters));
		return getLinks(response).slice(0, MAX);
	} catch (error) {
		console.error(error);
		return [];
	}
};

export {InternetArchive};
