import config, {ConfigKey} from "../../../common/entities/config";
import {FormData, getFormData, insertFormData, onFormRender} from "../../entities/bookForm";
import {showToast, ToastType} from "../../../common/ui/toast";
import {createIconButton} from "../../../common/ui/button";
import {saveFormData} from "./common";

const onCopy = async (event: Event) => {
	event.preventDefault();
	await saveFormData(getFormData());
};

const isEmptySaveData = (saveData: FormData) => Object.keys(saveData).length === 0;

const onPaste = async (event: Event) => {
	event.preventDefault();
	try {
		const saveData = await config.get(ConfigKey.FormData);
		if (isEmptySaveData(saveData)) {
			showToast(
				"No save data found. Try copying a book's data using the 'Copy' button before pasting",
				ToastType.ERROR
			);
		} else {
			insertFormData(saveData);
		}
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
