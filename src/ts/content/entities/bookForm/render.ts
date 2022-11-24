import {FormAreaElement} from "./types";
import {formExists, getForm, getFormElements} from "./util";
import {createOnSave, OffSave, OnSave} from "./save";

type ForEachFormElement = (callback: (element: FormAreaElement) => void) => void;
type FormRenderListener = (
	form: HTMLElement,
	forEachElement: ForEachFormElement,
	onSave: OnSave,
	offSave: OffSave
) => void;

const FORM_RENDER_EVENT = "library-thing-form-rendered";

const forEachFormElement: ForEachFormElement = (callback: (element: FormAreaElement) => void): void =>
	getFormElements().forEach(callback);

const listeners = new Map<FormRenderListener, () => void>();
// kinda gross but i don't have a better idea without a bIG refactor
let save: {onSave: OnSave; offSave: OffSave};

const encloseCallbackArguments = (callback: FormRenderListener) => () =>
	callback(getForm(), forEachFormElement, save.onSave, save.offSave);

const onFormRender = (callback: FormRenderListener): void => {
	const listener = encloseCallbackArguments(callback);
	listeners.set(callback, listener);
	window.addEventListener(FORM_RENDER_EVENT, listener);
};

const offFormRender = (callback: FormRenderListener): void => {
	window.removeEventListener(FORM_RENDER_EVENT, listeners.get(callback));
	listeners.delete(callback);
};

const onceFormRender = (callback: FormRenderListener): void =>
	window.addEventListener(FORM_RENDER_EVENT, encloseCallbackArguments(callback), {once: true});

const handleFormMutation = () => {
	if (formExists()) {
		save = createOnSave();
		window.dispatchEvent(new Event(FORM_RENDER_EVENT));
	}
};

window.addEventListener("pageshow", () => {
	const editForm = getForm();
	if (editForm) {
		new MutationObserver(handleFormMutation).observe(editForm, {subtree: false, childList: true});
		handleFormMutation();
	}
});

export type {ForEachFormElement, FormRenderListener};
export {onFormRender, offFormRender, onceFormRender};
