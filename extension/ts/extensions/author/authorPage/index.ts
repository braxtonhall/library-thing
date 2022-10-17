import Author, {AuthorRecord} from "../../../adapters/author";
import {appendUI, getInput, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";
import {createLoader, removeLoader} from "../../../ui/loadingIndicator";
import Book, {BookRecord} from "../../../adapters/book/index";
import {showToast, ToastType} from "../../../ui/toast";

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
	const identity = (success) => success;
	const loader = createLoader();
	const {uuid, name} = getAuthorInfo();
	let allFailed, allPassed;
	try {
		const [author, books] = await Promise.all([Author.getAuthor(uuid), getBooks(uuid)]);
		const tags = author?.tags ?? [];
		const futureUpdates = books.map(updateBook(uuid, tags));
		const updates = await Promise.all(futureUpdates);
		allFailed = !updates.some(identity);
		allPassed = updates.every(identity);
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

const createUpdateBook =
	(getAuthor: (uuid: string) => Promise<AuthorRecord>, saveBook: (book: BookRecord) => Promise<void>) =>
	(uuid: string, tags: string[]) =>
	async (book: BookRecord): Promise<boolean> => {
		try {
			// book_tags = book.author_tags
			const bookTags = Author.filterAuthorTags(book.tags);
			// maybe_delete_tags = book_tags - author_tags
			const maybeDeleteTags = bookTags.filter((tag) => !tags.includes(tag));
			// other_author_tags = book.authors.filter(_ not equals author_id).flat(google_doc.get_tags)
			const futureOtherAuthors = book.authorIds.filter((author) => author !== uuid).map(getAuthor);
			const otherAuthors = await Promise.all(futureOtherAuthors);
			const otherAuthorTags = Author.filterAuthorTags(otherAuthors.flatMap((author) => author?.tags ?? []));
			// delete_tags = maybe_delete_tags.filter(_ not in other_author_tags)
			const deleteTags = maybeDeleteTags.filter((tag) => !otherAuthorTags.includes(tag));
			// book.author_tags = (book_tags + author_tags) - delete_tags
			const allTags = [...new Set([...book.tags, ...tags])];
			book.tags = allTags.filter((tag) => !deleteTags.includes(tag));
			await saveBook(book);
			return true;
		} catch (error) {
			console.error(book, error);
			return false;
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

// Exported for testing
export {createUpdateBook};
