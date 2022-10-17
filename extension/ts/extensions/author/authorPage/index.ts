import Author from "../../../adapters/author";
import {appendUI, getInput, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";
import {createLoader, removeLoader} from "../../../ui/loadingIndicator";
import Book, {BookRecord} from "../../../adapters/book/index";
import {showToast, ToastType} from "../../../ui/toast";
import {createUpdateBook} from "./updateBook";

const onEdit = () => {
	viewTagEditor();
};

const onSave = async () => {
	const tags = getInput().split(",");
	const loader = createLoader();
	const author = await Author.writeAuthor({...getAuthorInfo(), tags});
	author && insertTags(author.tags);
	viewExistingTags();
	removeLoader(loader);
};

const getExpectedBookCount = () => {
	const booksBy = document.querySelector("p.booksby > a")?.textContent ?? "";
	const [countString] = booksBy.split(" ");
	const count = Number(countString);
	return isFinite(count) ? count : 0;
};

const getCoauthorBooks = async (): Promise<BookRecord[]> => {
	const workLinks = Array.from(document.querySelectorAll(".li_have > a"));
	const workHrefs = workLinks.map((link: HTMLLinkElement) => link.href);
	const futureCoauthorBooks = workHrefs.map(Book.getBooksFromWork);
	return (await Promise.all(futureCoauthorBooks)).flat();
};

const getBooks = async (uuid: string): Promise<BookRecord[]> => {
	const books = await Book.getBooks({author: uuid});
	if (books.length >= getExpectedBookCount()) {
		return books;
	} else {
		return Book.removeDuplicates([...books, ...(await getCoauthorBooks())]);
	}
};

const onSync = async () => {
	const isTruthy = (book) => !!book;
	const loader = createLoader();
	const {uuid, name} = getAuthorInfo();
	let allFailed, allPassed;
	try {
		const [author, books] = await Promise.all([Author.getAuthor(uuid), getBooks(uuid)]);
		const tags = author?.tags ?? [];
		const futureUpdates = books.map(updateBook(uuid, tags));
		const updates = await Promise.all(futureUpdates);
		allFailed = !updates.some(isTruthy);
		allPassed = updates.every(isTruthy);
	} catch (error) {
		console.error(error);
		allFailed = true;
		allPassed = false;
	}
	removeLoader(loader);

	if (allFailed) {
		showToast(`Failed to sync tags for ${name}`, ToastType.ERROR);
	} else if (allPassed) {
		showToast(`Synced tags for ${name}`, ToastType.SUCCESS);
	} else {
		showToast("Failed to sync tags for some books", ToastType.WARNING);
	}
};

const updateBook = createUpdateBook(Author.getAuthor, Book.saveBook);

const getAuthorInfo = () => {
	const [, , uuid] = window.location.pathname.split("/");
	const name = document.querySelector("div.authorIdentification > h1").textContent;
	return {name, uuid};
};

const getTags = async () => {
	const author = await Author.getAuthor(getAuthorInfo().uuid);
	author && insertTags(author.tags);
};

window.addEventListener("load", async () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector<HTMLTableCellElement>("table.authorContentTable td.middle");
		if (container) {
			appendUI(container, onSync, onEdit, onSave);
			await getTags();
		}
	}
});
