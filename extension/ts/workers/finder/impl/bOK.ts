import {Finder, FinderParameters, FinderResponse} from "../finder";
import {get$} from "../../../services/request";
import {Element} from "cheerio";
import {getLinks} from "./util/getLinks";

const BASE_URL = "https://b-ok.cc";
const SEARCH_PATH = "/s"
const MAX = 3;

const bOK: Finder = async ({author, title}: FinderParameters): Promise<FinderResponse> => {
	const searchUrl = `${BASE_URL}${SEARCH_PATH}/${encodeURI(`${title} ${author}`)}`;
	// TODO actually visit these websites and make sure that there is a download button
	// For example: https://b-ok.cc/book/17689031/7bf9fc
	return getLinks({
		searchUrl,
		baseUrl: BASE_URL,
		maxResults: MAX,
		aSelector: ".exactMatch .bookRow .itemCover a"
	});
};

export {bOK};
