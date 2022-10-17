import {createFinderExtension} from "../util/finderExtension";
import {getAuthorIdsFromLinks} from "../../util/getAuthorIdsFromLinks";
import Author from "../../adapters/author";

const authorIds = () =>
	getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("div.headsummary > h2 a[href]"));

const getAuthorTags = async () => {
	const futureAuthors = authorIds().map(Author.getAuthor);
	const authors = await Promise.all(futureAuthors);
	const tags = authors.flatMap((author) => author?.tags ?? []);
	return Author.filterAuthorTags(tags);
};

// TODO if not authed, and there are changes, disable the button

createFinderExtension<string[]>({
	buttonName: "Sync Author Tags",
	finder: getAuthorTags,
	onFail: () => "No author tags found for this book",
	onSuccess: () => "Author tags synced",
	isSuccess: (tags: string[]) => tags.length > 0,
	textAreaContainerId: "bookedit_tags",
	textAreaId: "form_tags",
	transform: (tags: string[]) => tags.join(", "),
	delimiter: ", ",
});
