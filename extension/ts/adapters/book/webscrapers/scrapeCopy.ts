import {getAuthorIdsFromLinks} from "../../../util/getAuthorIdsFromLinks";

const getTags = (document: Document): string[] => {
	const collection = document.querySelectorAll(
		"div.qelcontent.bookinfo > table.bookinformation > tbody > tr:nth-child(3) > td:nth-child(4) > span:nth-child(1) > a"
	);
	const tagLinks = Array.from(collection);
	return tagLinks.map((link) => link.textContent.trim());
};

const scrapeCopy = (id: string, document: Document) => {
	const authorIds = getAuthorIdsFromLinks(document.querySelectorAll("#middleColumn > div.headsummary > h2 a"));
	const tags = getTags(document);
	return {id, tags, authorIds};
};

export {scrapeCopy};
