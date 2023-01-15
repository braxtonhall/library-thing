import {FormAreaElement, FormData} from "../types";
import {getFormElements} from "../util";
import {ensureRolesInputCount, show} from "../ui";
import {match} from "../../../../common/util/match";
import {collections} from "./collections";

const FORM_META_DATA_KEY = "___metadata_";
const ROLES_INPUT_COUNT_KEY = "___roles-count_";

/**
 * This is how specific elements should be transformed as a paste operation occurs
 * Indexed using the element ID on librarything.com
 */
type Transformer<T> = (incoming: T, existing: T) => T;
const checkedTransformers: {[elementId: string]: Transformer<boolean>} = {};
const valueTransformers: {[elementId: string]: Transformer<string>} = {
	item_inventory_barcode_1: (incoming, existing) => existing,
	form_comments: (incoming, existing) => {
		if (existing === incoming) {
			// Don't remove existing data on an accidental paste
			return existing;
		} else {
			return incoming
				.split("\n")
				.filter((line) => !/^\s*LOCATION:.+/i.test(line))
				.join("\n");
		}
	},
};

const extractFromFormData = (targetElement: Element, formData: FormData) =>
	match(targetElement)
		.case(...collections.fromFormData(formData))
		.default(() => formData[targetElement.id] ?? targetElement)
		.yield();

// form metadata is data ABOUT the form. this could be extended in the future,
// like ... for physical description
const getFormMetadata = (document: Document): FormData => ({
	[FORM_META_DATA_KEY]: {[ROLES_INPUT_COUNT_KEY]: getRolesInputCount(document)},
});

// We subtract one to omit the main author, who is not part of the roles section
const getRolesInputCount = (document: Document): number =>
	document.querySelectorAll("input.bookEditInput.bookPersonName").length - 1;

// We can't change hidden elements because LibraryThing relies
// on hidden form inputs to send additional, form-specific metadata
// on save
const isFormDataElement = (element: FormAreaElement): boolean => element && element.id && element.type !== "hidden";

const getFormData = (_document = document) =>
	getFormElements(_document).reduce((formData: FormData, element: any) => {
		if (isFormDataElement(element)) {
			match(element)
				.case(...collections.fromElement(formData))
				.default(() => (formData[element.id] = {value: element.value, checked: element.checked}))
				.yield();
		}
		return formData;
	}, getFormMetadata(_document));

const transformIncomingData = (incoming: any, existing: any) => {
	const transformedValue = valueTransformers[existing.id]?.(incoming.value, existing.value) ?? incoming.value;
	const transformedChecked =
		checkedTransformers[existing.id]?.(incoming.checked, existing.checked) ?? incoming.checked;
	return {value: transformedValue, checked: transformedChecked};
};

const insertFormData = (formData: FormData) => {
	ensureRolesInputCount(formData?.[FORM_META_DATA_KEY]?.[ROLES_INPUT_COUNT_KEY] ?? 0);
	getFormElements(document).forEach((element: any) => {
		if (isFormDataElement(element)) {
			const {value, checked} = transformIncomingData(extractFromFormData(element, formData), element);
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
const ensureVisible = (element: Element) =>
	match(element)
		.case(collections.predicate, show)
		.default((): void => undefined)
		.yield();

export {getFormData, insertFormData};
