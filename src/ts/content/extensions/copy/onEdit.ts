import config, {ConfigKey} from "../../../common/entities/config";
import {FormData, getFormData, insertFormData, onFormRender} from "../../entities/bookForm";
import {showToast, ToastType} from "../../../common/ui/toast";
import {appendRow, makeButton, saveFormData} from "./common";
import {addTooltip} from "../../../common/ui/tooltip";

const onCopy = () => saveFormData(getFormData());

const isEmptySaveData = (saveData: FormData) => Object.keys(saveData).length === 0;

const onPaste = async () => {
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

const appendCopyPaste = (table: HTMLTableElement) => {
	const pasteButton = makeButton("Paste book", "img/paste.png", onPaste);
	const editTooltip = addTooltip(pasteButton, {text: "Paste"});
	pasteButton.addEventListener("mouseenter", onHoverPasteButton(editTooltip));
	appendRow(table, makeButton("Copy book", "img/save.png", onCopy), pasteButton);
};

const onHoverPasteButton = (editTooltip: (text: string) => void) => async () => {
	const formData = await config.get(ConfigKey.FormData);
	const existingTitle = formData["form_title"]?.["value"];
	if (existingTitle !== undefined) {
		editTooltip(`Paste "${existingTitle}"`);
	} else {
		editTooltip("Nothing to paste");
	}
};

onFormRender((form: HTMLElement) => Array.from(form.getElementsByClassName("book_bitTable")).forEach(appendCopyPaste));
