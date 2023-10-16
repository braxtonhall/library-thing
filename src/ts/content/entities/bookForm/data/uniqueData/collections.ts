import {FormData} from "../../types";
import {uniqueFormElement} from "./uniqueFormElement";

const COLLECTIONS_ID_PREFIX = "collection_u_";
const COLLECTIONS_KEY = "___collections_";

const isCollectionsElement = (element: Element): boolean => element.id.startsWith(COLLECTIONS_ID_PREFIX);

const extractCollectionsDataFromFormDataStrict = (formData: FormData, element) => {
	const span = element.parentElement.getElementsByTagName("span")[0];
	return formData[COLLECTIONS_KEY]?.[span?.textContent] ?? false;
};

const extractCollectionsDataFromFormData = (formData: FormData, element) =>
	extractCollectionsDataFromFormDataStrict(formData, element) || element;

const extractCollectionsDataFromElement = (formData: FormData, element) => {
	const collections = formData[COLLECTIONS_KEY] ?? {};
	const span = element.parentElement.getElementsByTagName("span")?.[0];
	const record = {value: element.value, checked: element.checked};
	collections[span.textContent] = record;
	formData[COLLECTIONS_KEY] = collections;
	return record;
};

const collections = uniqueFormElement({
	predicate: isCollectionsElement,
	fromElement: extractCollectionsDataFromElement,
	fromFormData: extractCollectionsDataFromFormData,
	fromFormDataStrict: extractCollectionsDataFromFormDataStrict,
});

export {collections, isCollectionsElement};
