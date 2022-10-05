import {Finder, FinderParameters, FinderResponse} from "../finder";
import {get$} from "../../../services/request";
import {Element} from "cheerio";

const MAX = 3;

const BASE_URL = "https://libgen.is";

const getUrl = (base: string, queryKey: string, maxLenQuery: number, parameters: FinderParameters) =>
	`${base}${ new URLSearchParams({[queryKey]: shorten(maxLenQuery, parameters)})}`;

const findFiction: Finder = async (parameters: FinderParameters): Promise<FinderResponse> => {
	const url = getUrl("https://libgen.is/fiction/?", "q", Infinity, parameters);
	const $ = await get$(url);

	const paths = [];
	$("table.catalog > tbody > tr > td:nth-child(3) a").each((_, element: Element) => {
		paths.push($(element).attr("href"));
	});
	return paths.slice(0, MAX).map((path) => `${BASE_URL}${path}`);
};

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

const findNonFiction: Finder = async (parameters: FinderParameters): Promise<FinderResponse> => {
	const url = getUrl("https://libgen.is/search.php?", "req", 80, parameters);
	const $ = await get$(url);
	console.log(url);
	const paths = [];
	$("table.c > tbody > tr > td:nth-child(3) > a").each((_, element: Element) => {
		paths.push($(element).attr("href"));
	});
	console.log(paths);
	return paths.slice(0, MAX).map((path) => `${BASE_URL}${path}`);
};

const LibGen: Finder = async (parameters: FinderParameters): Promise<FinderResponse> => {
	return findNonFiction(parameters);
};

export {LibGen};
