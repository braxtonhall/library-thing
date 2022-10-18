import {loaderOverlaid} from "../../../ui/loadingIndicator";
import {showToast, ToastType} from "../../../ui/toast";
import Book, {BookRecord} from "../../../adapters/book";
import {getAuthorInfo} from "./util";

const isTruthy = (book) => !!book;

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

interface EditAllBooksParams {
	updateBook: (book: BookRecord) => Promise<BookRecord>;
	onError: (name: string) => string;
	onSuccess: (name: string) => string;
	onWarning: (name: string) => string;
}

const onEditAllBooks =
	({updateBook, onError, onSuccess, onWarning}: EditAllBooksParams) =>
	async () => {
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

export {onEditAllBooks};
