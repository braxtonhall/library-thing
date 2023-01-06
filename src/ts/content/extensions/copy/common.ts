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

type RowButton = {text: string; img: string; onClick: () => void};
const appendRow = (table: HTMLTableElement, ...buttons: RowButton[]) => {
	const [row] = Array.from(table.getElementsByTagName("tr"));
	buttons.forEach(({text, img, onClick}) => appendButton(row, text, img, onClick));
};

const appendButton = (element: HTMLElement, text: string, imgSrc: string, onClick: (event: Event) => void) => {
	const button = createIconButton(text, imgSrc, onClick);
	button.style.padding = "0px 8px";
	const deleteButtonIndex = element.children.length - 1;
	element.insertBefore(button, element.children[deleteButtonIndex]);
};

export {saveFormData, appendRow};
