import {showToast, ToastType} from "../ui/toast";
import {FORM_RENDER_EVENT} from "../services/renderFormObserver";
import {getFormData, insertFormData} from "../util/bookForm";

const SAVE_DATA_KEY = "_save-data";

const onCopy = (event: Event) => {
	event.preventDefault();
	localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(getFormData()));
	showToast(
		"The metadata for this book was saved!\n\nYou can use the Paste button on a different book's page to paste in your saved metadata.",
		ToastType.SUCCESS
	);
};

const onPaste = (event: Event) => {
	event.preventDefault();
	try {
		const saveData = JSON.parse(localStorage.getItem(SAVE_DATA_KEY) ?? "{}");
		insertFormData(saveData);
	} catch (error) {
		console.error(error);
		showToast("Something went wrong when trying to paste metadata :/", ToastType.ERROR);
	}
};

const appendButton = (element: HTMLElement, text: string, onClick: (event: Event) => void) => {
	const button = document.createElement("button");
	button.innerHTML = text;
	button.addEventListener("click", onClick);
	const td = document.createElement("td");
	td.appendChild(button);
	element.appendChild(td);
};

const appendRow = (table: HTMLTableElement) => {
	const row = document.createElement("tr");
	appendButton(row, "Copy book", onCopy);
	appendButton(row, "Paste book", onPaste);
	const [body] = Array.from(table.getElementsByTagName("tbody"));
	body.appendChild(row);
};

window.addEventListener(FORM_RENDER_EVENT, () => {
	Array.from(document.getElementsByClassName("book_bitTable")).forEach(appendRow);
});
