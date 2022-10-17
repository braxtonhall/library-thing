import {BookRecord} from "./types";
import {getDocument} from "../../services/finder/util/getDocument";
import {getBook} from "./bookFromEdition";
import {scrapeCopy} from "./scrapeCopy";
import {syncCached} from "./bookCache";

const getCopy = (document: Document): BookRecord => {
	const editionLink = document.querySelector<HTMLLinkElement>(
		"table.bookinformation td.bibliographicinfo b.almostalwaysblack > a[href]"
	);
	const id = editionLink.href.split("=").pop();
	return syncCached(id, () => scrapeCopy(id, document));
};

const getOtherEditions = async (yourCopyInfo: HTMLDivElement): Promise<BookRecord[]> => {
	const otherEditionLinks = Array.from(yourCopyInfo.querySelectorAll<HTMLLinkElement>("div.copylist > p > b > a"));
	const futureOtherEditions = otherEditionLinks.map((link) => getBook(link.href));
	return Promise.all(futureOtherEditions);
};

const getBooksFromWork = async (link: string): Promise<BookRecord[]> => {
	const workPage = await getDocument(link);
	const yourCopyInfo = workPage.querySelector<HTMLDivElement>(".qelcontent.bookinfo");
	if (yourCopyInfo) {
		const thisCopy = getCopy(workPage);
		const otherEditions = await getOtherEditions(yourCopyInfo);
		return [thisCopy, ...otherEditions];
	} else {
		return [];
	}
};

export {getBooksFromWork};
