import {AuthorRecord} from "../../../adapters/author";
import {BookRecord} from "../../../adapters/book/index";
import {filterAuthorTags} from "../../../util/filterAuthorTags";

const getOtherAuthorTags = async (
	book: BookRecord,
	currentAuthor: string,
	getAuthor: (uuid: string) => Promise<AuthorRecord>
) => {
	const futureOtherAuthors = book.authorIds.filter((author) => author !== currentAuthor).map(getAuthor);
	const otherAuthors = await Promise.all(futureOtherAuthors);
	return filterAuthorTags(otherAuthors.flatMap((author) => author?.tags ?? []));
};

const getBookOnlyTags = (tags: string[]) => {
	const authorTags = filterAuthorTags(tags);
	return tags.filter((tag) => !authorTags.includes(tag));
};

/**
 * yes, i know this code is unreadable, hence the comments
 *
 * perhaps one day i will come in and clean it up -- i think it could be simpler
 */
const createUpdateBook =
	(getAuthor: (uuid: string) => Promise<AuthorRecord>, saveBook: (book: BookRecord) => Promise<void>) =>
	(currentAuthorId: string, currentAuthorTags: string[]) =>
	async (book: BookRecord): Promise<BookRecord> => {
		try {
			// get only the author tags for current book
			const bookTags = filterAuthorTags(book.tags);
			// might need to delete author tags not on this author
			const maybeDeleteTags = bookTags.filter((tag) => !currentAuthorTags.includes(tag));
			// first get all authors that aren't the current one
			const otherAuthorTags = await getOtherAuthorTags(book, currentAuthorId, getAuthor);
			// if a tag isn't on any author, it should be deleted
			const deleteTags = maybeDeleteTags.filter((tag) => !otherAuthorTags.includes(tag));
			// finally, all tags except the deleted ones
			const allTags = [...new Set([...book.tags, ...filterAuthorTags(currentAuthorTags)])];
			book.tags = allTags.filter((tag) => !deleteTags.includes(tag));
			await saveBook(book);
			return book;
		} catch (error) {
			console.error(book, error);
			return null;
		}
	};

/**
 * This version syncs every book with all of its authors! And it's easier to read!
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const alternate =
	(getAuthor: (uuid: string) => Promise<AuthorRecord>, saveBook: (book: BookRecord) => Promise<void>) =>
	(currentAuthorId: string, currentAuthorTags: string[]) =>
	async (book: BookRecord): Promise<BookRecord> => {
		try {
			const bookTags = getBookOnlyTags(book.tags);
			const otherAuthorTags = await getOtherAuthorTags(book, currentAuthorId, getAuthor);
			const keepAuthorTags = filterAuthorTags([...otherAuthorTags, ...currentAuthorTags]);
			const allTagsSet = new Set([...bookTags, ...keepAuthorTags]);
			const newBook = {...book, tags: [...allTagsSet]};
			await saveBook(newBook);
			return newBook;
		} catch (error) {
			console.error(book, error);
			return null;
		}
	};

export {createUpdateBook};
