import {FORM_RENDER_EVENT, RELEVANT_TAGS} from "./constants";
import {SaveData} from "./types";
import {showToast, ToastType} from "./toast";
import {getElementsByTags} from "./util";

const COLLECTIONS_ID_PREFIX = "collection_u_";
const SAVE_DATA_KEY = "_save-data";
const COLLECTIONS_KEY = "___collections_";

const saveData = (parent: HTMLElement) => (event: Event) => {
	event.preventDefault();
	localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(getSaveData(parent)));
	showToast(
		"The metadata for this book was saved!\n\nYou can use the LOAD button on a different book's page to paste in your saved metadata.",
		ToastType.SUCCESS
	);
};

const loadData = (parent: HTMLElement) => (event: Event) => {
	event.preventDefault();
	const saveData = JSON.parse(localStorage.getItem(SAVE_DATA_KEY) ?? "{}");
	insertSaveData(parent, saveData);
};

const getSaveData = (parent: HTMLElement) => {
	const elements = getElementsByTags(parent, RELEVANT_TAGS);
	return elements.reduce((saveData: SaveData, element: any) => {
		// We can't change hidden elements because LibraryThing relies
		// on hidden form inputs to send additional, form-specific metadata
		// on save
		if (element && element.id && element.type !== "hidden") {
			const {value, checked} = element;
			if (element.id.startsWith(COLLECTIONS_ID_PREFIX)) {
				const collections = saveData[COLLECTIONS_KEY] || {};
				const [span] = element.parentElement.getElementsByTagName("span");
				collections[span.textContent] = {value, checked};
				saveData[COLLECTIONS_KEY] = collections;
			} else {
				saveData[element.id] = {value, checked};
			}
		}
		return saveData;
	}, {});
};

const insertSaveData = (parent: HTMLElement, saveData: SaveData) => {
	const elements = getElementsByTags(parent, RELEVANT_TAGS);
	return elements.forEach((element: any) => {
		// We can't change hidden elements because LibraryThing relies
		// on hidden form inputs to send additional, form-specific metadata
		// on save
		if (element && element.id && element.type !== "hidden") {
			let saveElement = element;
			if (element.id.startsWith(COLLECTIONS_ID_PREFIX)) {
				const span = element.parentElement.getElementsByTagName("span")[0];
				saveElement = saveData[COLLECTIONS_KEY][span.textContent] || element;
			} else {
				saveElement = saveData[element.id] || element;
			}
			element.value = saveElement.value;
			element.checked = saveElement.checked;
		}
	});
};

const appendButton = (element: HTMLElement, text: string, onClick: (e: Event) => void) => {
	const button = document.createElement("button");
	button.innerHTML = text;
	button.addEventListener("click", onClick);
	const td = document.createElement("td");
	td.appendChild(button);
	element.appendChild(td);
};

const appendRow = (editForm: HTMLElement) => (table: HTMLTableElement) => {
	const row = document.createElement("tr");
	appendButton(row, "SAVE", saveData(editForm));
	appendButton(row, "LOAD", loadData(editForm));
	const [body] = Array.from(table.getElementsByTagName("tbody"));
	body.appendChild(row);
};

window.addEventListener(FORM_RENDER_EVENT, () => {
	const editForm = document.getElementById("book_editForm");
	Array.from(document.getElementsByClassName("book_bitTable")).forEach(appendRow(editForm));
});
