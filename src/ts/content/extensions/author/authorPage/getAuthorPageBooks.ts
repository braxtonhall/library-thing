import Book, {BookRecord} from "../../../adapters/book";

const getExpectedBookCount = () => {
	const booksBy = document.querySelector("p.booksby > a")?.textContent ?? "";
	const [countString] = booksBy.split(" ");
	const count = Number(countString);
	return isFinite(count) ? count : 0;
};

const getCoauthorBooks = async (): Promise<BookRecord[]> => {
	const workLinks = Array.from(document.querySelectorAll(".li_have > a"));
	const workHrefs = workLinks.map((link: HTMLLinkElement) => link.href);
	const futureCoauthorBooks = workHrefs.map(Book.getBooksFromWorkPage);
	return (await Promise.all(futureCoauthorBooks)).flat();
};

const getAuthorPageBooks = async (uuid: string): Promise<BookRecord[]> => {
	const books = await Book.getBooks({author: uuid});
	if (books.length >= getExpectedBookCount()) {
		return books;
	} else {
		return Book.removeDuplicates([...books, ...(await getCoauthorBooks())]);
	}
};

export {getAuthorPageBooks};
