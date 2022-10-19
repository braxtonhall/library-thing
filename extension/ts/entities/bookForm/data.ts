import {FormData} from "./types";
import {getFormElements} from "./util";
import {ensureAuthorInputCount, show} from "./ui";

const COLLECTIONS_ID_PREFIX = "collection_u_";
const COLLECTIONS_KEY = "___collections_";

const FORM_META_DATA_KEY = "___metadata_";
const AUTHOR_INPUT_COUNT_KEY = "___author-count_";

const extractSaveDataFor = (targetElement: Element, formData: FormData) => {
	if (targetElement.id.startsWith(COLLECTIONS_ID_PREFIX)) {
		const span = targetElement.parentElement.getElementsByTagName("span")[0];
		return formData[COLLECTIONS_KEY][span?.textContent] ?? targetElement;
	} else {
		return formData[targetElement.id] ?? targetElement;
	}
};

// form metadata is data ABOUT the form. this could be extended in the future,
// like ... for physical description
const getFormMetadata = (): FormData => ({[FORM_META_DATA_KEY]: {[AUTHOR_INPUT_COUNT_KEY]: getAuthorInputCount()}});

const getAuthorInputCount = (): number => document.querySelectorAll("input.bookEditInput.bookPersonName").length;

const getFormData = () =>
	getFormElements().reduce((saveData: FormData, element: any) => {
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
	}, getFormMetadata());

const insertFormData = (saveData: FormData) => {
	ensureAuthorInputCount(saveData?.[FORM_META_DATA_KEY]?.[AUTHOR_INPUT_COUNT_KEY] ?? 0);
	getFormElements().forEach((element: any) => {
		// We can't change hidden elements because LibraryThing relies
		// on hidden form inputs to send additional, form-specific metadata
		// on save
		if (element && element.id && element.type !== "hidden") {
			const {value, checked} = extractSaveDataFor(element, saveData);
			if (element.value !== value || element.checked !== checked) {
				element.value = value;
				element.checked = checked;
				element.dispatchEvent(new Event("change"));
				ensureVisible(element);
			}
		}
	});
};

// This is a little weird that this is in this file... Probably doesn't belong here, but I don't want
// to expose COLLECTIONS_ID_PREFIX
const ensureVisible = (element: Element) => element.id.startsWith(COLLECTIONS_ID_PREFIX) && show(element);

export {getFormData, insertFormData};
