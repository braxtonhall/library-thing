import {get$} from "../../../../services/request";
import {Element} from "cheerio";

interface GetLinksEnv {
	baseUrl: string;
	searchUrl: string;
	aSelector: string;
	maxResults: number;
}

const getLinks = async ({searchUrl, aSelector, baseUrl, maxResults}: GetLinksEnv): Promise<string[]> => {
	const $ = await get$(searchUrl);
	const paths: string[] = [];
	$(aSelector).each((_, element: Element) => {
		paths.push($(element).attr("href"));
	});
	return paths.slice(0, maxResults).map((path) => `${baseUrl}/${path}`);
};

export {getLinks};
