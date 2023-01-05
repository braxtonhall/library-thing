import config, {ConfigKey} from "../../../common/entities/config";
import {FormData, getFormData, insertFormData, onFormRender} from "../../entities/bookForm";
import {showToast, ToastType} from "../../../common/ui/toast";
import {appendRow, saveFormData} from "./common";

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

const appendCopyPaste = (table: HTMLTableElement) =>
	appendRow(
		table,
		{text: "Copy book", img: "img/save.png", onClick: onCopy},
		{text: "Paste book", img: "img/paste.png", onClick: onPaste}
	);

onFormRender((form: HTMLElement) => Array.from(form.getElementsByClassName("book_bitTable")).forEach(appendCopyPaste));
