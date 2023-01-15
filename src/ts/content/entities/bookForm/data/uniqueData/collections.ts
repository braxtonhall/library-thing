import {FormData} from "../../types";
import {uniqueFormElement} from "./uniqueFormElement";

const COLLECTIONS_ID_PREFIX = "collection_u_";
const COLLECTIONS_KEY = "___collections_";

const isCollectionsElement = (element: Element): boolean => element.id.startsWith(COLLECTIONS_ID_PREFIX);

const extractCollectionsDataFromFormData = (formData: FormData, element) => {
	const span = element.parentElement.getElementsByTagName("span")[0];
	return formData[COLLECTIONS_KEY]?.[span?.textContent] ?? element;
};

const extractCollectionsDataFromElement = (formData: FormData, element) => {
	const collections = formData[COLLECTIONS_KEY] || {};
	const span = element.parentElement.getElementsByTagName("span")?.[0];
	collections[span.textContent] = {value: element.value, checked: element.checked};
	formData[COLLECTIONS_KEY] = collections;
};

const collections = uniqueFormElement({
	predicate: isCollectionsElement,
	fromElement: extractCollectionsDataFromElement,
	fromFormData: extractCollectionsDataFromFormData,
});

export {collections};
