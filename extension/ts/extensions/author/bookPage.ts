import {createFinderExtension} from "../util/finderExtension";
import {getAuthorIdsFromLinks} from "../../util/getAuthorIdsFromLinks";
import {isAuthorized} from "./util/isAuthorized";
import {getAuthorTags} from "./util/getAuthorTags";
import Author from "../../adapters/author";

const authorIds = () =>
	getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("div.headsummary > h2 a[href]"));

createFinderExtension<string[]>({
	buttonName: "Pull Author Tags",
	buttonImage: "img/book-and-quill.png",
	finder: () => getAuthorTags(authorIds(), Author.getAuthor),
	onFail: () => "No author tags found for this book",
	onSuccess: () => "Author tags synced",
	isSuccess: (tags: string[]) => tags.length > 0,
	textAreaContainerId: "bookedit_tags",
	textAreaId: "form_tags",
	transform: (tags: string[]) => tags.join(", "),
	delimiter: ", ",
	condition: isAuthorized,
});
