import Author from "../../../adapters/author";
import {insertTags} from "./authorUI";
import {filterAuthorTags} from "../../../util/filterAuthorTags";
import {BookRecord} from "../../../adapters/book";

const getAuthorInfo = () => {
	const [, , uuid] = window.location.pathname.split("/");
	const name = document.querySelector("div.authorIdentification > h1").textContent;
	return {name, uuid};
};

const getTags = async () => {
	const author = await Author.getAuthor(getAuthorInfo().uuid);
	insertTags(author?.tags ?? []);
};

const authorTagsFromBooksWhere = (books: BookRecord[], where: (book: BookRecord) => boolean) =>
	filterAuthorTags(books.filter(where).flatMap((book) => book.tags));

export {getAuthorInfo, getTags, authorTagsFromBooksWhere};
