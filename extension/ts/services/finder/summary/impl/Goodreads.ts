import {SummaryFinder, SummaryFinderResponse} from "../summaryFinder";
import {FinderParameters} from "../../finder";
import {getDocument} from "../../util/getDocument";

const BASE_URL = "https://www.goodreads.com";
const SEARCH_PATH = "/search?";

const goodreads: SummaryFinder = async ({isbn}: FinderParameters): Promise<SummaryFinderResponse> => {
	const url = `${BASE_URL}${SEARCH_PATH}${new URLSearchParams({q: isbn}).toString()}`;
	const div = (await getDocument(url))
		.getElementsByClassName("BookPageMetadataSection__description")
		.item(0);
	const summary = div?.textContent ?? "";
	return summary.replace(/Show more$/, "");
};

export {goodreads};
