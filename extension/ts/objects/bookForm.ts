type ForEachFormElement = (callback: (element: Element) => void) => void;
type FormRenderListener = (form: HTMLElement, forEachElement: ForEachFormElement) => void;
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
	}, {});

const insertFormData = (saveData: FormData) =>
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

const ensureVisible = (element: Element) => {
	// LibraryThing collections checkboxes are sometimes hidden beneath a div that is not visible
	// THIS IS BRITTLE and relies on the specific markup tree of LibraryThing
	if (element.id.startsWith(COLLECTIONS_ID_PREFIX)) {
		const hiddenAncestor = element.closest<HTMLElement>('div[style="display:none;"]');
		if (hiddenAncestor) {
			hiddenAncestor.style.display = "";
		}
	}
};

const forEachFormElement: ForEachFormElement = (callback: (element: Element) => void): void =>
	getFormElements().forEach(callback);

const listeners = new Map<FormRenderListener, () => void>();

const onFormRender = (callback: FormRenderListener): void => {
	const listener = () => callback(getForm(), forEachFormElement);
	listeners.set(callback, listener);
	window.addEventListener(FORM_RENDER_EVENT, listener);
};

const offFormRender = (callback: FormRenderListener): void => {
	window.removeEventListener(FORM_RENDER_EVENT, listeners.get(callback));
	listeners.delete(callback);
};

const oneFormRender = (callback: FormRenderListener): void => {
	const realCallback = (form, forEachFormElement) => {
		offFormRender(realCallback);
		callback(form, forEachFormElement);
	};
	onFormRender(realCallback);
};

/**
 * I hate that this lives here,
 * but I don't want to expose COLLECTIONS_KEY
 *
 * Also, this dumb implementation only works
 * because the form is always the same order.
 *
 * This wouldn't work if the form could have elements rearranged
 * @param formA
 * @param formB
 */
const formDataEquals = (formA: FormData, formB: FormData): boolean => JSON.stringify(formA) === JSON.stringify(formB);

window.addEventListener("load", () => {
	const editForm = getForm();
	if (editForm) {
		const tryToEmit = () => formExists() && window.dispatchEvent(new Event(FORM_RENDER_EVENT));
		new MutationObserver(tryToEmit).observe(editForm, {subtree: false, childList: true});
		tryToEmit();
	}
});

export type {FormData, ForEachFormElement, FormRenderListener};
export {insertFormData, getFormData, onFormRender, offFormRender, oneFormRender, formDataEquals};
