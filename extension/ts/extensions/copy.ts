import {showToast, ToastType} from "../ui/toast";
import {FORM_RENDER_EVENT} from "../services/renderFormObserver";
import {getFormElements} from "../util/bookForm";
import {createButton} from "../ui/button";

const COLLECTIONS_ID_PREFIX = "collection_u_";
const SAVE_DATA_KEY = "_save-data";
const COLLECTIONS_KEY = "___collections_";

type SaveData = Record<string, Record<string, any>>;

const onCopy = (event: Event) => {
	event.preventDefault();
	localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(getSaveData()));
	showToast(
		"The metadata for this book was saved!\n\nYou can use the Paste button on a different book's page to paste in your saved metadata.",
		ToastType.SUCCESS
	);
};

const onPaste = (event: Event) => {
	event.preventDefault();
	try {
		const saveData = JSON.parse(localStorage.getItem(SAVE_DATA_KEY) ?? "{}");
		insertSaveData(saveData);
	} catch (error) {
		console.error(error);
		showToast("Something went wrong when trying to paste metadata :/", ToastType.ERROR);
	}
};

const getSaveData = () => getFormElements()
	.reduce((saveData: SaveData, element: any) => {
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


const extractSaveDataFor = (targetElement: Element, saveData: SaveData) => {
	if (targetElement.id.startsWith(COLLECTIONS_ID_PREFIX)) {
		const span = targetElement.parentElement.getElementsByTagName("span")[0];
		return saveData[COLLECTIONS_KEY][span?.textContent] ?? targetElement;
	} else {
		return saveData[targetElement.id] ?? targetElement;
	}
};

const insertSaveData = (saveData: SaveData) => getFormElements()
	.forEach((element: any) => {
		// We can't change hidden elements because LibraryThing relies
		// on hidden form inputs to send additional, form-specific metadata
		// on save
		if (element && element.id && element.type !== "hidden") {
			const {value, checked} = extractSaveDataFor(element, saveData);
			if (element.value !== value || element.checked !== checked) {
				element.value = value;
				element.checked = checked;
				element.dispatchEvent(new Event("change"));
			}
		}
	});

const appendButton = (element: HTMLElement, text: string, imgSrc: string, onClick: (event: Event) => void) => {
	const button = createButton(text, imgSrc, onClick);
	button.style.padding = "0px 8px";
	const deleteButtonIndex = element.children.length - 1;
	element.insertBefore(button, element.children[deleteButtonIndex]);
};

const appendRow = (table: HTMLTableElement) => {
	const [row] = Array.from(table.getElementsByTagName("tr"));
	appendButton(row, "Copy book", "img/save.png", onCopy);
	appendButton(row, "Paste book", "img/paste.png", onPaste);
};

window.addEventListener(FORM_RENDER_EVENT, () => {
	Array.from(document.getElementsByClassName("book_bitTable")).forEach(appendRow);
});
