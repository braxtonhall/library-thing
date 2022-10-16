import {getDocument} from "../services/finder/util/getDocument";

const SEARCH_URL = "https://www.librarything.com/catalog_bottom.php";

const getSearchURL = (query: Record<string, string>) => {
	const url = new URL(SEARCH_URL);
	url.search = new URLSearchParams(query).toString();
	return url.toString();
};

const getLinks = (document: Document, aSelector: string): string[] => {
	const links = document.querySelectorAll<HTMLLinkElement>(aSelector);
	return Array.from(links).map((link) => link.href);
};

const getOtherPages = (document: Document) => getLinks(document, "#pages > span > a");

const getBooksFromDocument = (document: Document) =>
	getLinks(document, "#lt_catalog_list > tbody > tr > td > a.lt-title");

const getBooksFromURL = async (url: string) => {
	const document = await getDocument(url);
	const otherPages = getOtherPages(document);
	const futurePageBooks = otherPages.map((link) =>
		getDocument(link)
			.then(getBooksFromDocument)
			.catch(() => [])
	);
	const pageBooks = await Promise.all(futurePageBooks);
	return [getBooksFromDocument(document), ...pageBooks].flat();
};

const getBooks = async (query: Record<string, string> = {}) => getBooksFromURL(getSearchURL(query));

export {getBooks};
