import {Finder, FinderParameters, FinderResponse} from "../finder";
import {get$} from "../../../services/request";
import {Element} from "cheerio";
import {getLinks} from "./util/getLinks";

const MAX = 3;

const BASE_URL = "https://libgen.is";

const getUrl = (base: string, queryKey: string, maxLenQuery: number, parameters: FinderParameters) =>
	`${base}${ new URLSearchParams({[queryKey]: shorten(maxLenQuery, parameters)})}`;

const simplify = (text: string): string =>
	text
		.replace(/[-'`~!@#$%^&*()_|+=?;:",.<>{}\[\]\\\/]/gi, ' ')
		.replace(/\s+/g, ' ');

const shorten = (maxLenQuery: number, {author, title}: FinderParameters): string => {
	const shorterAuthor = simplify(author);
	const shorterTitle = simplify(title);
	const combined = `${shorterAuthor} ${shorterTitle}`;
	if (combined.length > maxLenQuery) {
		console.log(combined);
		const maxLengthText = combined.slice(0, maxLenQuery).trim();
		return maxLengthText.replace(/\s[^\s]*$/, "");
	} else {
		return combined;
	}
};

const findFiction: Finder = async (parameters: FinderParameters): Promise<FinderResponse> => {
	const searchUrl = getUrl("https://libgen.is/fiction/?", "q", Infinity, parameters);
	return getLinks({
		searchUrl,
		baseUrl: BASE_URL,
		maxResults: MAX,
		aSelector: "table.catalog > tbody > tr > td:nth-child(3) a"
	});
};

const findNonFiction: Finder = async (parameters: FinderParameters): Promise<FinderResponse> => {
	const searchUrl = getUrl("https://libgen.is/search.php?", "req", 80, parameters);
	return getLinks({
		searchUrl,
		baseUrl: BASE_URL,
		maxResults: MAX,
		aSelector: "table.c > tbody > tr > td:nth-child(3) > a"
	});
};

const LibGen: Finder = async (parameters: FinderParameters): Promise<FinderResponse> => {
	return Promise.all([findFiction, findNonFiction].map((finder) => finder(parameters)))
		.then((results: string[][]) => results.flat());
};

export {LibGen};
