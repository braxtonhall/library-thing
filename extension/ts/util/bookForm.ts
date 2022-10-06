const FORM_DATA_ELEMENT_TAGS = ["textarea", "input", "select"];

const getElementsByTag = (parent: HTMLElement) => (tag: string) => Array.from(parent?.getElementsByTagName(tag) ?? []);

const getElementsByTags = (parent: HTMLElement, tags: string[]) => tags.flatMap(getElementsByTag(parent));

const getFormElements = (): Element[] => getElementsByTags(getForm(), FORM_DATA_ELEMENT_TAGS);

// This is relying on the fact that when the edit form is available, the html matches this selector,
// and fails to match in all other cases. This IS brittle. If LibraryThing changes
// the markup in any way this will just not work properly
const formExists = (): boolean => !!document.querySelector("#book_editForm > .book_bit");

const getForm = (): HTMLElement => document.getElementById("book_editForm");

export {getForm, getFormElements, formExists};
