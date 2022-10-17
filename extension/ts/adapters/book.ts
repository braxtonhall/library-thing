import {getDocument} from "../services/finder/util/getDocument";
import {getAuthorIdsFromLinks} from "../util/getAuthorIdsFromLinks";

const SEARCH_URL = "https://www.librarything.com/catalog_bottom.php";

interface BookRecord {
	id: string;
	tags: string[];
	authorIds: string[];
}

const getSearchURL = (query: Record<string, string>) => {
	const url = new URL(SEARCH_URL);
	url.search = new URLSearchParams(query).toString();
	return url.toString();
};

const getId = (link: string): string => new URL(link).pathname.split("/")[4];

const getOtherPages = (document: Document): string[] => {
	const links = document.querySelectorAll<HTMLLinkElement>("#pages > span > a");
	return Array.from(links).map((link) => link.href);
};

const getTags = (element: HTMLTableRowElement): string[] =>
	Array.from(element.querySelectorAll<HTMLLinkElement>("a.lt-tag"))
		.map((link) => link.innerText)
		.filter((tag) => !!tag);

const getAuthors = async (link: string): Promise<string[]> => {
	const document = await getDocument(link);
	return getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("td.bibliographicinfo a"));
};

const toBook = async (element: HTMLTableRowElement): Promise<BookRecord> => {
	const link = element.querySelector<HTMLLinkElement>("td > a.lt-title").href;
	const tags = getTags(element);
	const authorIds = await getAuthors(link);
	const id = getId(link);
	return {id, tags, authorIds};
};

const getBooksFromDocument = (document: Document): Promise<BookRecord[]> => {
	const rows = document.querySelectorAll<HTMLTableRowElement>("#lt_catalog_list > tbody > tr");
	return Promise.all(Array.from(rows).map(toBook));
};

const getBooksFromURL = async (url: string): Promise<BookRecord[]> => {
	const document = await getDocument(url);
	const otherPages = getOtherPages(document);
	const futurePageBooks = otherPages.map((link) =>
		getDocument(link)
			.then(getBooksFromDocument)
			.catch(() => [])
	);
	const allBooks = await Promise.all([getBooksFromDocument(document), ...futurePageBooks]);
	return allBooks.flat();
};

// TODO getting the books doesn't work if you are not the first author
// TODO make this work if you are not the first author
const getBooks = async (query: Record<string, string> = {}): Promise<BookRecord[]> =>
	getBooksFromURL(getSearchURL(query));

const saveBook = async (book: BookRecord): Promise<void> => {
	const body = new URLSearchParams({
		form_id: book.id,
		form_tags: book.tags.join(", "),
	});
	const response = await fetch("/ajax_changetags2.php", {method: "POST", body});
	if (!response.ok) {
		throw new Error("Could not save book");
	}
};

export type {BookRecord};
export default {getBooks, saveBook};
