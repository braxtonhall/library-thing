import {PdfFinder, PdfFinderResponse} from "../pdfFinder";
import {getLinks} from "./util/getLinks";
import {FinderParameters} from "../../finder";

const BASE_URL = "https://b-ok.cc";
const SEARCH_PATH = "/s";
const MAX = 3;

const bOK: PdfFinder = async ({author, title}: FinderParameters): Promise<PdfFinderResponse> => {
	const searchUrl = `${BASE_URL}${SEARCH_PATH}/${encodeURI(`${title} ${author}`)}`;
	// TODO actually visit these websites and make sure that there is a download button
	// For example: https://b-ok.cc/book/17689031/7bf9fc
	return getLinks({
		searchUrl,
		baseUrl: BASE_URL,
		maxResults: MAX,
		aSelector: ".exactMatch .bookRow .itemCover a",
	});
};

export {bOK};
