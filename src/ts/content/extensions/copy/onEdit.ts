import config, {ConfigKey} from "../../../common/entities/config";
import {
	FormData,
	getFormData,
	insertFormData,
	onceFormRender,
	onFormRemoved,
	onFormRender,
} from "../../entities/bookForm";
import {showToast, ToastType} from "../../../common/ui/toast";
import {appendRow, makeButton, saveFormData} from "./common";
import {addTooltip} from "../../../common/ui/tooltip";
import {onBackgroundEvent} from "../../util/onBackgroundEvent";
import {BackgroundEvent} from "../../../common/backgroundEvent";

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

const tooltipEditors = new Set<(text: string) => void>();

const appendCopyPaste = (table: HTMLTableElement) => {
	const pasteButton = makeButton("Paste book", "img/paste.png", onPaste);
	const editTooltip = addTooltip(pasteButton, {text: "Paste"});
	tooltipEditors.add(editTooltip);
	appendRow(table, makeButton("Copy book", "img/save.png", onCopy), pasteButton);
};

const onBookCopied = () => {
	const existingTitle = getFormData()?.["form_title"]?.["value"];
	if (existingTitle) {
		tooltipEditors.forEach((editor) => editor(`Paste "${existingTitle}"`));
	}
};

onceFormRender(() => onBackgroundEvent(BackgroundEvent.BookCopied, onBookCopied));

onFormRender((form: HTMLElement) => {
	Array.from(form.getElementsByClassName("book_bitTable")).forEach(appendCopyPaste);
	onBookCopied();
});

onFormRemoved(() => tooltipEditors.clear());
