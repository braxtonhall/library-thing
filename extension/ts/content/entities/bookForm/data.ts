import {FormAreaElement, FormData} from "./types";
import {getFormElements} from "./util";
import {ensureRolesInputCount, show} from "./ui";

const COLLECTIONS_ID_PREFIX = "collection_u_";
const COLLECTIONS_KEY = "___collections_";

const FORM_META_DATA_KEY = "___metadata_";
const ROLES_INPUT_COUNT_KEY = "___roles-count_";

// IDs of elements we don't want to copy/paste
const ID_BLACKLIST = new Set(["item_inventory_barcode_1"]);

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
const getFormMetadata = (): FormData => ({[FORM_META_DATA_KEY]: {[ROLES_INPUT_COUNT_KEY]: getRolesInputCount()}});

// We subtract one to omit the main author, who is not part of the roles section
const getRolesInputCount = (): number => document.querySelectorAll("input.bookEditInput.bookPersonName").length - 1;

// We can't change hidden elements because LibraryThing relies
// on hidden form inputs to send additional, form-specific metadata
// on save
const isFormDataElement = (element: FormAreaElement): boolean =>
	element && element.id && element.type !== "hidden" && !ID_BLACKLIST.has(element.id);

const getFormData = () =>
	getFormElements().reduce((saveData: FormData, element: any) => {
		if (isFormDataElement(element)) {
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
	ensureRolesInputCount(saveData?.[FORM_META_DATA_KEY]?.[ROLES_INPUT_COUNT_KEY] ?? 0);
	getFormElements().forEach((element: any) => {
		if (isFormDataElement(element)) {
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
