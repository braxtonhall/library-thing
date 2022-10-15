import {PdfFinder, PdfFinderResponse} from "../pdfFinder";
import {getLinks} from "./util/getLinks";
import {FinderParameters} from "../../finder";

const MAX = 3;

const BASE_URL = "https://libgen.is";

const getUrl = (base: string, queryKey: string, maxLenQuery: number, parameters: FinderParameters) =>
	`${base}${new URLSearchParams({[queryKey]: shorten(maxLenQuery, parameters)})}`;

const simplify = (text: string): string =>
	text.replace(/[-'`~!@#$%^&*()_|+=?;:",.<>{}[\]\\/]/gi, " ").replace(/\s+/g, " ");

const shorten = (maxLenQuery: number, {author, title}: FinderParameters): string => {
	const shorterAuthor = simplify(author);
	const shorterTitle = simplify(title);
	const combined = `${shorterAuthor} ${shorterTitle}`;
	if (combined.length > maxLenQuery) {
		const maxLengthText = combined.slice(0, maxLenQuery).trim();
		return maxLengthText.replace(/\s[^\s]*$/, "");
	} else {
		return combined;
	}
};

const findFiction: PdfFinder = async (parameters: FinderParameters): Promise<PdfFinderResponse> => {
	const searchUrl = getUrl("https://libgen.is/fiction/?", "q", Infinity, parameters);
	return getLinks({
		searchUrl,
		baseUrl: BASE_URL,
		maxResults: MAX,
		aSelector: "table.catalog > tbody > tr > td:nth-child(3) a",
	});
};

const findNonFiction: PdfFinder = async (parameters: FinderParameters): Promise<PdfFinderResponse> => {
	// LibGen has a limit of 80 characters on its searches
	const searchUrl = getUrl("https://libgen.is/search.php?", "req", 80, parameters);
	return getLinks({
		searchUrl,
		baseUrl: BASE_URL + "/", // non-fiction links are relative, not absolute
		maxResults: MAX,
		aSelector: "table.c > tbody > tr > td:nth-child(3) > a",
	});
};

const LibGen: PdfFinder = async (parameters: FinderParameters): Promise<PdfFinderResponse> => {
	return Promise.all([findFiction, findNonFiction].map((finder) => finder(parameters))).then((results: string[][]) =>
		results.flat()
	);
};

export {LibGen};
