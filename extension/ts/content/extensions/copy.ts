import {showToast, ToastType} from "../../common/ui/toast";
import {getFormData, insertFormData, onFormRender} from "../entities/bookForm";
import {createIconButton} from "../../common/ui/button";

const SAVE_DATA_KEY = "_save-data";
const BARCODE_ID = "item_inventory_barcode_1";

const onCopy = (event: Event) => {
	event.preventDefault();
	localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(getFormData()));
	showToast(
		"The metadata for this book was saved!\n\nYou can use the Paste button on a different book's page to paste in your saved metadata.",
		ToastType.SUCCESS
	);
};

const focusOn = (id: string) => {
	const element = document.getElementById(id);
	const top = window.scrollY; // capture the height before focus
	element?.focus(); // focus will scroll us down
	window.scroll({top}); // scroll us back up immediately
	element?.scrollIntoView({behavior: "smooth"}); // smooth scroll down
};

const onPaste = (event: Event) => {
	event.preventDefault();
	try {
		const saveData = JSON.parse(localStorage.getItem(SAVE_DATA_KEY) ?? "{}");
		insertFormData(saveData, new Set([BARCODE_ID]));
		focusOn(BARCODE_ID);
	} catch (error) {
		console.error(error);
		showToast("Something went wrong when trying to paste metadata :/", ToastType.ERROR);
	}
};

const appendButton = (element: HTMLElement, text: string, imgSrc: string, onClick: (event: Event) => void) => {
	const button = createIconButton(text, imgSrc, onClick);
	button.style.padding = "0px 8px";
	const deleteButtonIndex = element.children.length - 1;
	element.insertBefore(button, element.children[deleteButtonIndex]);
};

const appendRow = (table: HTMLTableElement) => {
	const [row] = Array.from(table.getElementsByTagName("tr"));
	appendButton(row, "Copy book", "img/save.png", onCopy);
	appendButton(row, "Paste book", "img/paste.png", onPaste);
};

onFormRender((form: HTMLElement) => Array.from(form.getElementsByClassName("book_bitTable")).forEach(appendRow));
