import {AuthorRecord} from "../../../adapters/author";
import {BookRecord} from "../../../adapters/book/index";
import {filterAuthorTags} from "../../../util/filterAuthorTags";

const createUpdateBook =
	(getAuthor: (uuid: string) => Promise<AuthorRecord>, saveBook: (book: BookRecord) => Promise<void>) =>
	(uuid: string, tags: string[]) =>
	async (book: BookRecord): Promise<BookRecord> => {
		try {
			// book_tags = book.author_tags
			const bookTags = filterAuthorTags(book.tags);
			// maybe_delete_tags = book_tags - author_tags
			const maybeDeleteTags = bookTags.filter((tag) => !tags.includes(tag));
			// other_author_tags = book.authors.filter(_ not equals author_id).flat(google_doc.get_tags)
			const futureOtherAuthors = book.authorIds.filter((author) => author !== uuid).map(getAuthor);
			const otherAuthors = await Promise.all(futureOtherAuthors);
			const otherAuthorTags = filterAuthorTags(otherAuthors.flatMap((author) => author?.tags ?? []));
			// delete_tags = maybe_delete_tags.filter(_ not in other_author_tags)
			const deleteTags = maybeDeleteTags.filter((tag) => !otherAuthorTags.includes(tag));
			// book.author_tags = (book_tags + author_tags) - delete_tags
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
