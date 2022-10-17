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

/**
 * yes, i know this code is unreadable, hence the comments
 *
 * perhaps one day i will come in and clean it up -- i think it could be simpler
 */
const createUpdateBook =
	(getAuthor: (currentAuthorId: string) => Promise<AuthorRecord>, saveBook: (book: BookRecord) => Promise<void>) =>
	(uuid: string, tags: string[]) =>
	async (book: BookRecord): Promise<BookRecord> => {
		try {
			// get only the author tags for current book
			const bookTags = filterAuthorTags(book.tags);
			// might need to delete author tags not on this author
			const maybeDeleteTags = bookTags.filter((tag) => !tags.includes(tag));
			// first get all authors that aren't the current one
			const otherAuthorTags = await getOtherAuthorTags(book, uuid, getAuthor);
			// if a tag isn't on any author, it should be deleted
			const deleteTags = maybeDeleteTags.filter((tag) => !otherAuthorTags.includes(tag));
			// finally, all tags except the deleted ones
			const allTags = [...new Set([...book.tags, ...filterAuthorTags(tags)])];
			book.tags = allTags.filter((tag) => !deleteTags.includes(tag));
			await saveBook(book);
			return book;
		} catch (error) {
			console.error(book, error);
			return null;
		}
	};

export {createUpdateBook};
