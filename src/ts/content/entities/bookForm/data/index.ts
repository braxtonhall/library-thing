import {FormAreaElement, FormData, FormMetaDataDecorator} from "../types";
import {getFormElements} from "../util";
import {show} from "../ui";
import {match} from "../../../../common/util/match";
import {collections, isCollectionsElement} from "./uniqueData/collections";
import {transformIncomingData} from "./transformData";
import {matchFactoryFromDescriptors} from "./uniqueData/uniqueFormElement";
import {ensureRolesInputCount, addRoleCountToMetaData} from "./uniqueData/roles";
import {
	physicalDescription,
	addDescriptionCountsToMetaData,
	ensurePhysicalDescriptionInputCounts,
} from "./uniqueData/physicalDescription";

const FORM_META_DATA_KEY = "___metadata_";

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
	[FORM_META_DATA_KEY]: [addRoleCountToMetaData, addDescriptionCountsToMetaData].reduce(
		(metaData: Record<string, unknown>, callback: FormMetaDataDecorator) => callback(document, metaData),
		{}
	),
});

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
	const metaData = formData?.[FORM_META_DATA_KEY] ?? {};
	ensureRolesInputCount(metaData);
	ensurePhysicalDescriptionInputCounts(metaData);
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

const ensureVisible = (element: Element) =>
	match(element)
		.case(isCollectionsElement, show)
		.default((): void => undefined)
		.yield();

export {getFormData, insertFormData};
