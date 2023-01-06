import {FormData} from "../../entities/bookForm";
import config, {ConfigKey} from "../../../common/entities/config";
import {showToast, ToastType} from "../../../common/ui/toast";
import {createIconButton} from "../../../common/ui/button";

const saveFormData = async (formData: FormData) => {
	await config.set(ConfigKey.FormData, formData);
	showToast(
		"The metadata for this book was saved!\n\nYou can use the Paste button on a different book's page to paste in your saved metadata.",
		ToastType.SUCCESS
	);
};

const appendRow = (table: HTMLTableElement, ...buttons: HTMLTableCellElement[]) => {
	const row = table.getElementsByTagName("tr").item(0);
	buttons.forEach(appendButton(row));
};

const makeButton = (text: string, imgSrc: string, onClick: (event: Event) => void): HTMLTableCellElement => {
	const button = createIconButton(text, imgSrc, onClick);
	button.style.padding = "0px 8px";
	return button;
};

const appendButton = (element: HTMLElement) => (button: HTMLTableCellElement) => {
	const deleteButtonIndex = element.children.length - 1;
	element.insertBefore(button, element.children[deleteButtonIndex]);
};

export {saveFormData, appendRow, makeButton};
