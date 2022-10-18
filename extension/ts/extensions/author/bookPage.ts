import {createFinderExtension} from "../util/finderExtension";
import {getAuthorIdsFromLinks} from "../../util/getAuthorIdsFromLinks";
import {getAuthorTags} from "./util";
import Author from "../../adapters/author";

const authorIds = () =>
	getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("div.headsummary > h2 a[href]"));

createFinderExtension<string[]>({
	buttonName: "Pull Author Tags",
	finder: () => getAuthorTags(authorIds(), Author.getAuthor),
	onFail: () => "No author tags found for this book",
	onSuccess: () => "Author tags synced",
	isSuccess: (tags: string[]) => tags.length > 0,
	textAreaContainerId: "bookedit_tags",
	textAreaId: "form_tags",
	transform: (tags: string[]) => tags.join(", "),
	delimiter: ", ",
});
