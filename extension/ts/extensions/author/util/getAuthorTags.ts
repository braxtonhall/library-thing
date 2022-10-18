import {AuthorRecord} from "../../../adapters/author";
import {filterAuthorTags} from "../../../util/filterAuthorTags";

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

export {getAuthorTags};
