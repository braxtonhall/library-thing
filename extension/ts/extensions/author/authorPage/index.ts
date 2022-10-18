import Author from "../../../adapters/author";
import {appendUI, getInput, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";
import {loaderOverlaid} from "../../../ui/loadingIndicator";
import Book, {BookRecord} from "../../../adapters/book";
import {showToast, ToastType} from "../../../ui/toast";
import {createSyncBookTags} from "../util";

const onEdit = () => {
	viewTagEditor();
};

const onSave = () => {
	const tags = getInput().split(",");
	return loaderOverlaid(async () => {
		const author = await Author.writeAuthor({...getAuthorInfo(), tags});
		author && insertTags(author.tags);
		viewExistingTags();
	});
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
	const {uuid, name} = getAuthorInfo();
	let allFailed, allPassed;

	await loaderOverlaid(async () => {
		try {
			const books = await getBooks(uuid);
			const futureSyncs = books.map(updateBook);
			const syncs = await Promise.all(futureSyncs);
			allFailed = !syncs.some(isTruthy);
			allPassed = syncs.every(isTruthy);
		} catch (error) {
			console.error(error);
			allFailed = true;
			allPassed = false;
		}
	});

	if (allFailed) {
		showToast(`Failed to sync tags for ${name}`, ToastType.ERROR);
	} else if (allPassed) {
		showToast(`Synced tags for ${name}`, ToastType.SUCCESS);
	} else {
		showToast("Failed to sync tags for some books", ToastType.WARNING);
	}
};

const updateBook = createSyncBookTags(Author.getAuthor, Book.saveBook);

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
