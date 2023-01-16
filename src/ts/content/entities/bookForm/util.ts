import {FormAreaElement, FormData} from "./types";

const FORM_DATA_ELEMENT_TAGS = ["textarea", "input", "select", "fieldset"];

const getElementsByTag = (parent: HTMLElement) => (tag: string) => Array.from(parent?.getElementsByTagName(tag) ?? []);

const getElementsByTags = (parent: HTMLElement, tags: string[]) => tags.flatMap(getElementsByTag(parent));

const getFormElements = (document: Document): FormAreaElement[] =>
	getElementsByTags(getForm(document), FORM_DATA_ELEMENT_TAGS) as FormAreaElement[];

// This is relying on the fact that when the edit form is available, the html matches this selector,
// and fails to match in all other cases. This IS brittle. If LibraryThing changes
// the markup in any way this will just not work properly
const formExists = (): boolean => !!document.querySelector("#book_editForm .book_bit #form_title"); // yes this is cursed, no we do not care

const getForm = (document: Document): HTMLElement => document.getElementById("book_editForm");

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

export {getForm, getFormElements, formExists, formDataEquals};
