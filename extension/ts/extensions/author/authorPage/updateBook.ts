import {AuthorRecord} from "../../../adapters/author";
import {BookRecord} from "../../../adapters/book/index";
import {filterAuthorTags} from "../../../util/filterAuthorTags";

const getOtherAuthorTags = async (
	authorIds: string[],
	currentAuthor: string,
	getAuthor: (uuid: string) => Promise<AuthorRecord>
) => {
	const futureOtherAuthors = authorIds.filter((author) => author !== currentAuthor).map(getAuthor);
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
	async ({id, tags: bookTags, authorIds}: BookRecord): Promise<BookRecord> => {
		try {
			// get only the author tags for current book
			const bookAuthorTags = filterAuthorTags(bookTags);
			// might need to delete author tags not on this author
			const maybeDeleteTags = bookAuthorTags.filter((tag) => !currentAuthorTags.includes(tag));
			// first get all authors that aren't the current one
			const otherAuthorTags = await getOtherAuthorTags(authorIds, currentAuthorId, getAuthor);
			// if a tag isn't on any author, it should be deleted
			const deleteTags = maybeDeleteTags.filter((tag) => !otherAuthorTags.includes(tag));
			// finally, all tags except the deleted ones
			const allTags = [...new Set([...bookTags, ...filterAuthorTags(currentAuthorTags)])];
			const book = {id, authorIds, tags: allTags.filter((tag) => !deleteTags.includes(tag))};
			await saveBook(book);
			return book;
		} catch (error) {
			console.error({id, tags: bookTags, authorIds}, error);
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
	async ({id, authorIds, tags: bookTags}: BookRecord): Promise<BookRecord> => {
		try {
			const bookOnlyTags = getBookOnlyTags(bookTags);
			const otherAuthorTags = await getOtherAuthorTags(authorIds, currentAuthorId, getAuthor);
			const keepAuthorTags = filterAuthorTags([...otherAuthorTags, ...currentAuthorTags]);
			const allTagsSet = new Set([...bookOnlyTags, ...keepAuthorTags]);
			const newBook = {id, authorIds, tags: [...allTagsSet]};
			await saveBook(newBook);
			return newBook;
		} catch (error) {
			console.error({id, authorIds, tags: bookTags}, error);
			return null;
		}
	};

export {createUpdateBook};
