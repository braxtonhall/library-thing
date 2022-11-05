import {insertFinder} from "../util/finderExtension";
import {getAuthorIdsFromLinks} from "../../util/getAuthorIdsFromLinks";
import {getAuthorTags} from "./util/getAuthorTags";
import Author from "../../adapters/author";
import {onFormRender} from "../../entities/bookForm";
import {onLoggedIn} from "../util/onLoggedIn";

const authorIds = () =>
	getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("div.headsummary > h2 a[href]"));

// TODO move this into "extension/tags"
onFormRender(() => {
	const textAreaContainerId = "bookedit_tags";
	const textAreaContainer = document.getElementById(textAreaContainerId);
	return onLoggedIn(() => {
		insertFinder<string[]>({
			buttonName: "Pull Author Tags",
			buttonImage: "img/book-and-quill.png",
			finder: () => getAuthorTags(authorIds(), Author.getAuthor),
			onFail: () => "No author tags found for this book",
			onSuccess: () => "Author tags synced",
			isSuccess: (tags: string[]) => tags.length > 0,
			textAreaContainerId,
			textAreaId: "form_tags",
			transform: (tags: string[]) => tags.join(", "),
			delimiter: ", ",
		});
	}, textAreaContainer);
});
