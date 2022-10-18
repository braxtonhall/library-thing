import {AuthorRecord} from "../../adapters/author";
import {BookRecord} from "../../adapters/book";
import {filterAuthorTags} from "../../util/filterAuthorTags";

const getAuthorTags = async (authorIds: string[], getAuthor: (uuid: string) => Promise<AuthorRecord>) => {
	try {
		const futureAuthors = authorIds.map(getAuthor);
		const authors = await Promise.all(futureAuthors);
		const tags = authors.flatMap((author) => author?.tags ?? []);
		return filterAuthorTags(tags);
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getBookOnlyTags = (tags: string[]): string[] => {
	const authorTags = filterAuthorTags(tags);
	return tags.filter((tag) => !authorTags.includes(tag));
};

const createBookEditor =
	(filterBookTags: (tags: string[]) => string[]) =>
	(getAuthor: (uuid: string) => Promise<AuthorRecord>, saveBook: (book: BookRecord) => Promise<void>) =>
	async ({id, authorIds, tags: bookTags}: BookRecord): Promise<BookRecord> => {
		try {
			const keepBookTags = filterBookTags(bookTags);
			const authorTags = filterAuthorTags(await getAuthorTags(authorIds, getAuthor));
			const allTagsSet = new Set([...keepBookTags, ...authorTags]);
			const newBook = {id, authorIds, tags: [...allTagsSet]};
			await saveBook(newBook);
			return newBook;
		} catch (error) {
			console.error({id, authorIds, tags: bookTags}, error);
			return null;
		}
	};

const createSyncBookTags = createBookEditor(getBookOnlyTags);
const createPushBookTags = createBookEditor((tags) => tags);

export {createSyncBookTags, createPushBookTags, getAuthorTags};
