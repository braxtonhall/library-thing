import {BookRecord} from "./types";
import {getBooks} from "./bookFromSearch";
import {getBooksFromWork} from "./bookFromWork";
import {getBook} from "./bookFromEdition";
import {setCache} from "./bookCache";

const saveBook = async (book: BookRecord): Promise<void> => {
	const body = new URLSearchParams({
		form_id: book.id,
		form_tags: book.tags.join(", "),
	});
	const response = await fetch("/ajax_changetags2.php", {method: "POST", body});
	if (!response.ok) {
		throw new Error("Could not save book");
	}
	setCache(book.id, book);
};

const removeDuplicates = (books: BookRecord[]): BookRecord[] => {
	const bookMap = books.reduce((map, book) => map.set(book.id, book), new Map<string, BookRecord>());
	return Array.from(bookMap.values());
};

export type {BookRecord};
export default {getBook, getBooksFromWork, getBooks, saveBook, removeDuplicates};
