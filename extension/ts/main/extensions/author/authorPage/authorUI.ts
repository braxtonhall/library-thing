import {createIconButton} from "../../../ui/button";
import {createHeader} from "../../../ui/header";
import {onLoggedIn} from "../../util/onLoggedIn";

const TAG_LIST_ID = "vbl-tag-list";
const TAG_INPUT_ID = "vbl-tag-input";

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

const createTagInput = () => {
	const input = document.createElement("input");
	input.id = TAG_INPUT_ID;
	input.classList.add("bookEditInput");
	return input;
};

const createEditTagsSection = ({onSave, onPull, onCancel}: ButtonHandlers) => {
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

const createCurrentTagsButtons = ({onPush, onSync, onEdit}: ButtonHandlers, getTagsCallback: () => Promise<void>) => {
	const container = document.createElement("div");
	container.id = TAG_LIST_BUTTON_CONTAINER_ID;
	onLoggedIn(
		async () => {
			container.append(
				createTagButton("Push", "img/book.png", onPush, "Add this author's tags to all of their books")
			);
			container.append(
				createTagButton(
					"Sync",
					"img/enchanted-book.png",
					onSync,
					"Add this author's tags to all of their books, and delete extra tags"
				)
			);
			container.append(createTagButton("Edit", "img/edit.gif", onEdit));
			await getTagsCallback();
		},
		container,
		"Log in to manage this author's book tags"
	);
	return container;
};

const createCurrentTagsSection = (handlers: ButtonHandlers, getTagsCallback: () => Promise<void>) => {
	const section = createSection();
	section.id = TAG_LIST_CONTAINER_ID;
	section.innerHTML = `<span id="${TAG_LIST_ID}">Unknown</span>`;
	const buttons = createCurrentTagsButtons(handlers, getTagsCallback);
	section.append(buttons);
	return section;
};

const appendUI = (container: Element, handlers: ButtonHandlers, getTagsCallback: () => Promise<void>) => {
	const header = createHeader("Tags");
	const currentTagsSection = createCurrentTagsSection(handlers, getTagsCallback);
	const editTagsSection = createEditTagsSection(handlers);
	container.insertBefore(editTagsSection, container.children[2]);
	container.insertBefore(currentTagsSection, editTagsSection);
	container.insertBefore(header, currentTagsSection);
	viewExistingTags();
};

const insertTags = (tags: string[]) => {
	const list = document.getElementById(TAG_LIST_ID);
	const input = document.getElementById(TAG_INPUT_ID) as HTMLInputElement;
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

const getInput = (): string[] =>
	getInputElement()
		.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => !!tag);

const toggleViews = (showId: string, hideId: string) => () => {
	document.getElementById(showId).style.display = "";
	document.getElementById(hideId).style.display = "none";
};

const getInputElement = () => (document.getElementById(TAG_INPUT_ID) as HTMLInputElement)?.value ?? "";

const viewExistingTags = toggleViews(TAG_LIST_CONTAINER_ID, TAG_INPUT_CONTAINER_ID);
const viewTagEditor = toggleViews(TAG_INPUT_CONTAINER_ID, TAG_LIST_CONTAINER_ID);

export {appendUI, insertTags, getInput, viewExistingTags, viewTagEditor};
