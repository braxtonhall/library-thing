import {Finder, FinderParameters, FinderResponse} from "../finder";
import {get$} from "../../../services/request";
import {Element} from "cheerio";

const BASE_URL = "https://b-ok.cc";
const SEARCH_PATH = "/s"
const MAX = 3;

const bOK: Finder = async ({author, title}: FinderParameters): Promise<FinderResponse> => {
	const url = `${BASE_URL}${SEARCH_PATH}/${encodeURI(`${title} ${author}`)}`;
	const $ = await get$(url);
	const paths: string[] = [];
	$(".exactMatch .bookRow .itemCover a").each((_, element: Element) => {
		paths.push($(element).attr("href"));
	});
	// TODO actually visit these websites and make sure that there is a download button
	// For example: https://b-ok.cc/book/17689031/7bf9fc
	return paths.slice(0, MAX).map((path) => `${BASE_URL}/${path}`);
};

export {bOK};
