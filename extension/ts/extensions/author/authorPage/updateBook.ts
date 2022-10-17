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

const createUpdateBook =
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
