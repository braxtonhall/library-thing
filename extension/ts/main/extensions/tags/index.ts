import "../../../../sass/tags.sass";

import {onFormRender} from "../../entities/bookForm";
import {validateTags} from "./validation";
import {getAuthorIdsFromLinks} from "../../util/getAuthorIdsFromLinks";
import {onLogged} from "../util/onLogged";
import {appendFinder, hideFinder, showFinder} from "../util/finderExtension";
import {getAuthorTags} from "../util/getAuthorTags";
import Author from "../../adapters/author";

const authorIds = () =>
	getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("div.headsummary > h2 a[href]"));

onFormRender((form, forEachElement, onSave) => {
	const textAreaContainerId = "bookedit_tags";
	const textAreaContainer = document.getElementById(textAreaContainerId);
	if (textAreaContainer) {
		const id = "pull-author";
		appendFinder<string[]>({
			id,
			buttonName: "Pull Author Tags",
			buttonImage: "img/book-and-quill.png",
			description: "Copy the tags of every author of this book",
			finder: () => getAuthorTags(authorIds(), Author.getAuthor),
			onFail: () => "No author tags found for this book",
			onSuccess: () => "Author tags synced",
			isSuccess: (tags: string[]) => tags.length > 0,
			textAreaContainerId,
			textAreaId: "form_tags",
			transform: (tags: string[]) => tags.join(", "),
			delimiter: ", ",
		});

		return onLogged({
			container: textAreaContainer,
			description: "Log in for tag validation and to sync this book's tags with its authors' tags",
			onLogIn: () => {
				showFinder(id);
				return validateTags(onSave);
			},
			onLogOut: () => {
				hideFinder(id);
			},
		});
	}
});
