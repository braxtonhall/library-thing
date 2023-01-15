import {FormAreaElement, FormData} from "../types";
import {getFormElements} from "../util";
import {ensureRolesInputCount, show} from "../ui";
import {match} from "../../../../common/util/match";
import {collections} from "./uniqueData/collections";
import {physicalDescription} from "./uniqueData/physicalDescription";
import {transformIncomingData} from "./transformData";
import {matchFactoryFromDescriptors} from "./uniqueData/uniqueFormElement";

const FORM_META_DATA_KEY = "___metadata_";
const ROLES_INPUT_COUNT_KEY = "___roles-count_";

const matchFactory = matchFactoryFromDescriptors(collections, ...physicalDescription);

const extractFromFormData = matchFactory("fromFormData", (formData, element) => formData[element.id] ?? element);

const extractFromElement = matchFactory(
	"fromElement",
	(formData, element: any) => (formData[element.id] = {value: element.value, checked: element.checked})
);

const internalIsFormDataElement = matchFactory("isFormData", (_formData, element: any) => !!element.id);

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
const isFormDataElement = (element: FormAreaElement): boolean =>
	element && element.type !== "hidden" && internalIsFormDataElement(null, element);

const getFormData = (_document = document) =>
	getFormElements(_document).reduce((formData: FormData, element: any) => {
		isFormDataElement(element) && extractFromElement(formData, element);
		return formData;
	}, getFormMetadata(_document));

const insertFormData = (formData: FormData) => {
	ensureRolesInputCount(formData?.[FORM_META_DATA_KEY]?.[ROLES_INPUT_COUNT_KEY] ?? 0);
	getFormElements(document).forEach((element: any) => {
		if (isFormDataElement(element)) {
			const {value, checked} = transformIncomingData(extractFromFormData(formData, element), element);
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
