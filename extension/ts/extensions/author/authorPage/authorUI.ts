import {createButton} from "../../../ui/button";
import {createHeader} from "../../../ui/header";

const TAG_LIST_ID = "vbl-tag-list";
const TAG_INPUT_ID = "vbl-tag-input";

const TAG_LIST_BUTTON_CONTAINER_ID = "vbl-tag-list-buttons";

const TAG_LIST_CONTAINER_ID = "vbl-tag-list-container";
const TAG_INPUT_CONTAINER_ID = "vbl-tag-input-container";

const createTagLink = (tag: string) => {
	const link = document.createElement("a");
	link.innerText = tag;
	link.href = `/catalog/?tag=${encodeURI(tag)}`;
	return link;
};

const createTagButton = (text: string, imgSrc, onClick: () => void) => {
	const button = createButton(text, imgSrc, onClick);
	button.className += " author-tag-button";
	return button;
};

const createSection = () => {
	const section = document.createElement("div");
	section.className = "simpleSection worklist vbl-tag-container";
	return section;
};

const createEditTagsSection = (onSave: () => void) => {
	const section = createSection();
	section.id = TAG_INPUT_CONTAINER_ID;
	section.innerHTML = `<input id="${TAG_INPUT_ID}" class="bookEditInput">`;
	section.append(createTagButton("Save", "img/save.png", onSave));
	return section;
};

const createCurrentTagsButtons = (onSync: () => void, onEdit: () => void) => {
	const container = document.createElement("div");
	container.id = TAG_LIST_BUTTON_CONTAINER_ID;
	container.append(createTagButton("Sync", "img/book.png", onSync));
	container.append(createTagButton("Edit", "img/edit.png", onEdit));
	return container;
};

const createCurrentTagsSection = (onSync: () => void, onEdit: () => void) => {
	const section = createSection();
	section.id = TAG_LIST_CONTAINER_ID;
	section.innerHTML = `<span id="${TAG_LIST_ID}"></span>`;
	const buttons = createCurrentTagsButtons(onSync, onEdit);
	section.append(buttons);
	return section;
};

const appendUI = (container: Element, onSync: () => void, onEdit: () => void, onSave: () => void) => {
	const header = createHeader("Tags");
	const currentTagsSection = createCurrentTagsSection(onSync, onEdit);
	const editTagsSection = createEditTagsSection(onSave);
	container.insertBefore(editTagsSection, container.children[2]);
	container.insertBefore(currentTagsSection, editTagsSection);
	container.insertBefore(header, currentTagsSection);
	insertTags([]);
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

const toggleViews = (showId: string, hideId: string) => () => {
	document.getElementById(showId).style.display = "";
	document.getElementById(hideId).style.display = "none";
};

const getInput = () => (document.getElementById(TAG_INPUT_ID) as HTMLInputElement).value;

const viewExistingTags = toggleViews(TAG_LIST_CONTAINER_ID, TAG_INPUT_CONTAINER_ID);
const viewTagEditor = toggleViews(TAG_INPUT_CONTAINER_ID, TAG_LIST_CONTAINER_ID);

export {appendUI, insertTags, getInput, viewExistingTags, viewTagEditor};
