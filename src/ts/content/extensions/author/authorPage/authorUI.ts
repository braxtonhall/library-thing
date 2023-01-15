import {createIconButton} from "../../../../common/ui/button";
import {createHeader} from "../../../../common/ui/header";
import {onLogged} from "../../util/onLogged";
import {autocomplete} from "./autocomplete";
import {getTagsFromElement} from "../../../adapters/tags";

const TAG_LIST_ID = "vbl-tag-list";
const AUTHOR_TAG_INPUT_ID = "vbl-tag-input";

const TAG_LIST_BUTTON_CONTAINER_ID = "vbl-tag-list-buttons";

const TAG_LIST_CONTAINER_ID = "vbl-tag-list-container";
const TAG_INPUT_CONTAINER_ID = "vbl-tag-input-container";

interface ButtonHandlers {
	onPush: () => void;
	onSync: () => void;
	onEdit: () => void;
	onSave: () => void;
	onPull: () => void;
	onCancel: () => void;
}

const createTagLink = (tag: string) => {
	const link = document.createElement("a");
	link.innerText = tag;
	link.href = `/catalog/&tag=${encodeURIComponent(tag)}`;
	return link;
};

const createTagButton = (text: string, imgSrc: string, onClick: () => void, description?: string) => {
	const button = createIconButton(text, imgSrc, onClick, description);
	button.classList.add("author-tag-button");
	return button;
};

const createSection = () => {
	const section = document.createElement("div");
	section.className = "simpleSection worklist vbl-tag-container";
	return section;
};

const createTagInput = (): HTMLDivElement => {
	const input = document.createElement("textarea");
	input.id = AUTHOR_TAG_INPUT_ID;
	input.classList.add("bookEditInput");
	input.autocomplete = "off";

	const container = document.createElement("div");
	container.classList.add("vbl-tag-input-container");
	container.append(input);

	return autocomplete({container, input});
};

const editTagViewSection = ({onSave, onPull, onCancel}: ButtonHandlers) => {
	const section = createSection();
	section.id = TAG_INPUT_CONTAINER_ID;
	section.append(createTagInput());
	section.append(
		createTagButton("Pull", "img/book.png", onPull, "Copy author tags that already exist on this author's books")
	);
	section.append(createTagButton("Save", "img/save.png", onSave));
	section.append(createTagButton("Cancel", "img/cross.gif", onCancel));
	return section;
};

const currentTagViewButtons = ({onPush, onSync, onEdit}: ButtonHandlers, getTagsCallback: () => Promise<void>) => {
	const container = document.createElement("div");
	container.id = TAG_LIST_BUTTON_CONTAINER_ID;
	const onPushButton = createTagButton(
		"Push",
		"img/book.png",
		onPush,
		"Add this author's tags to all of their books"
	);
	const onSyncButton = createTagButton(
		"Sync",
		"img/enchanted-book.png",
		onSync,
		"Add this author's tags to all of their books, and delete extra tags"
	);
	const onEditButton = createTagButton("Edit", "img/edit.gif", onEdit);

	onLogged({
		container,
		description: "Log in to manage this author's book tags",
		onLogIn: async () => {
			container.append(onPushButton, onSyncButton, onEditButton);
			await getTagsCallback();
		},
		onLogOut: () => {
			viewExistingTags();
			onPushButton.remove();
			onSyncButton.remove();
			onEditButton.remove();
		},
	});
	return container;
};

const currentTagViewSection = (handlers: ButtonHandlers, getTagsCallback: () => Promise<void>) => {
	const section = createSection();
	section.id = TAG_LIST_CONTAINER_ID;
	section.innerHTML = `<span id="${TAG_LIST_ID}">Unknown</span>`;
	const buttonsContainer = currentTagViewButtons(handlers, getTagsCallback);
	section.append(buttonsContainer);
	return section;
};

const appendUI = (container: Element, handlers: ButtonHandlers, getTagsCallback: () => Promise<void>) => {
	const header = createHeader("Tags");
	const currentTagsSection = currentTagViewSection(handlers, getTagsCallback);
	const editTagsSection = editTagViewSection(handlers);
	container.insertBefore(editTagsSection, container.children[2]);
	container.insertBefore(currentTagsSection, editTagsSection);
	container.insertBefore(header, currentTagsSection);
	viewExistingTags();
};

const renderAuthorTags = (tags: string[]) => {
	const list = document.getElementById(TAG_LIST_ID);
	const input = document.getElementById(AUTHOR_TAG_INPUT_ID) as HTMLInputElement;
	if (tags.length === 0) {
		list.innerText = "None";
		input.value = "";
	} else {
		const tagLinks = tags.map(createTagLink);
		const listChildren = tagLinks.flatMap((element, i) => (i === 0 ? element : [", ", element]));
		list.replaceChildren(...listChildren);
		input.value = tags.join(", ");
	}
};

const getInput = (): string[] => getTagsFromElement(getInputElement());

const toggleViews = (showId: string, hideId: string) => () => {
	document.getElementById(showId).style.display = "";
	document.getElementById(hideId).style.display = "none";
};

const getInputElement = () => document.getElementById(AUTHOR_TAG_INPUT_ID) as HTMLInputElement;

const viewExistingTags = toggleViews(TAG_LIST_CONTAINER_ID, TAG_INPUT_CONTAINER_ID);
const viewTagEditor = toggleViews(TAG_INPUT_CONTAINER_ID, TAG_LIST_CONTAINER_ID);

export {appendUI, renderAuthorTags, getInput, viewExistingTags, viewTagEditor, AUTHOR_TAG_INPUT_ID};
