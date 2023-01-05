import {onFormRender} from "../entities/bookForm";
import {appendTagValidator} from "./util/tagValidation";
import {getAuthorIdsFromLinks} from "../util/getAuthorIdsFromLinks";
import {onLogged} from "./util/onLogged";
import {appendFinder} from "./util/finderExtension";
import {getAuthorTags} from "./util/getAuthorTags";
import Author from "../adapters/author";
import {getAncestry, getTagsFromElement} from "../adapters/tags";
import {appendContentWarningChecker} from "./util/contentWarningCheck";

const authorIds = () =>
	getAuthorIdsFromLinks(document.querySelectorAll<HTMLLinkElement>("div.headsummary > h2 a[href]"));

const noDuplicates = (list: string[]): string[] => [...new Set(list)];

const getAncestorTags = async (tags: string[]): Promise<string[]> => {
	const existingLowerTags = new Set(tags.map((tag) => tag.toLowerCase()));
	const futureAncestors = tags.map((tag) => getAncestry(tag));
	const ancestors = await Promise.all(futureAncestors);
	const minimalAncestors = noDuplicates(ancestors.flat());
	return minimalAncestors.filter((tag) => !existingLowerTags.has(tag.toLowerCase()));
};

onFormRender((form, forEachElement, onSave, offSave) => {
	const tagsTextAreaContainerId = "bookedit_tags";
	const tagsTextAreaId = "form_tags";
	const commentsTextArea = document.getElementById("bookedit_comments") as HTMLTextAreaElement;
	const tagsTextAreaContainer = document.getElementById(tagsTextAreaContainerId);
	const tagsTextArea = document.getElementById(tagsTextAreaId) as HTMLTextAreaElement;
	if (tagsTextAreaContainer && tagsTextArea && commentsTextArea) {
		const {showFinder: showAuthorPull, hideFinder: hideAuthorPull} = appendFinder<string[]>({
			buttonName: "Pull Author Tags",
			buttonImage: "img/book-and-quill.png",
			description: "Copy the tags of every author of this book",
			finder: () => getAuthorTags(authorIds(), Author.getAuthor),
			onFail: () => "No author tags found for this book",
			onSuccess: () => "Author tags pulled",
			isSuccess: (tags: string[]) => tags.length > 0,
			textAreaContainerId: tagsTextAreaContainerId,
			textAreaId: tagsTextAreaId,
			transform: (tags: string[]) => tags.join(", "),
			delimiter: ", ",
		});

		const {showFinder: showAncestors, hideFinder: hideAncestors} = appendFinder<string[]>({
			buttonName: "Add Ancestor Tags",
			buttonImage: "img/written-book.png",
			description: "Get parent tags for any current nested tags",
			finder: () => getAncestorTags(getTagsFromElement(tagsTextArea)),
			onFail: () => "No new ancestor tags found",
			onSuccess: () => "Ancestor tags added",
			isSuccess: (tags: string[]) => tags.length > 0,
			textAreaContainerId: tagsTextAreaContainerId,
			textAreaId: tagsTextAreaId,
			transform: (tags: string[]) => tags.join(", "),
			delimiter: ", ",
		});

		const {showTagValidator, hideTagValidator} = appendTagValidator(onSave, offSave, tagsTextArea);
		const {showContentWarningCheck, hideContentWarningCheck} = appendContentWarningChecker(
			onSave,
			offSave,
			tagsTextArea,
			commentsTextArea
		);

		const onLogOut = () => {
			hideAuthorPull();
			hideAncestors();
			hideTagValidator();
			hideContentWarningCheck();
		};
		onLogOut(); // Do it now so things don't pop in and out
		return onLogged({
			container: tagsTextAreaContainer,
			description: "Log in for tag validation and to sync this book's tags with its authors' tags",
			onLogIn: () => {
				showAuthorPull();
				showAncestors();
				showTagValidator();
				showContentWarningCheck();
			},
			onLogOut,
		});
	}
});
