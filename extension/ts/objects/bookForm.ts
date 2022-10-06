type ForEachFormElement = (callback: (element: Element) => void) => void;
type FormData = Record<string, Record<string, any>>;

const FORM_RENDER_EVENT = "library-thing-form-rendered";
const FORM_DATA_ELEMENT_TAGS = ["textarea", "input", "select"];
const COLLECTIONS_ID_PREFIX = "collection_u_";
const COLLECTIONS_KEY = "___collections_";

const getElementsByTag = (parent: HTMLElement) => (tag: string) => Array.from(parent?.getElementsByTagName(tag) ?? []);

const getElementsByTags = (parent: HTMLElement, tags: string[]) => tags.flatMap(getElementsByTag(parent));

const getFormElements = (): Element[] => getElementsByTags(getForm(), FORM_DATA_ELEMENT_TAGS);

// This is relying on the fact that when the edit form is available, the html matches this selector,
// and fails to match in all other cases. This IS brittle. If LibraryThing changes
// the markup in any way this will just not work properly
const formExists = (): boolean => !!document.querySelector("#book_editForm > .book_bit");

const getForm = (): HTMLElement => document.getElementById("book_editForm");

const extractSaveDataFor = (targetElement: Element, saveData: FormData) => {
	if (targetElement.id.startsWith(COLLECTIONS_ID_PREFIX)) {
		const span = targetElement.parentElement.getElementsByTagName("span")[0];
		return saveData[COLLECTIONS_KEY][span?.textContent] ?? targetElement;
	} else {
		return saveData[targetElement.id] ?? targetElement;
	}
};

const getFormData = () => getFormElements()
	.reduce((saveData: FormData, element: any) => {
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

const insertFormData = (saveData: FormData) => getFormElements()
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

const forEachFormElement: ForEachFormElement = (callback: (element: Element) => void): void =>
	getFormElements().forEach(callback);

const onFormRender = (callback: (form: HTMLElement, forEachElement: ForEachFormElement) => void): void =>
	window.addEventListener(FORM_RENDER_EVENT, () => callback(getForm(), forEachFormElement));

window.addEventListener("load", () => {
	const editForm = getForm();
	if (editForm) {
		const tryToEmit = () => formExists() && window.dispatchEvent(new Event(FORM_RENDER_EVENT));
		new MutationObserver(tryToEmit).observe(editForm, {subtree: false, childList: true});
		tryToEmit();
	}
});

export type {FormData, ForEachFormElement};
export {insertFormData, getFormData, onFormRender};
