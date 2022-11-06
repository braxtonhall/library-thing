import {FormAreaElement} from "./types";
import {formExists, getForm, getFormElements} from "./util";

type ForEachFormElement = (callback: (element: FormAreaElement) => void) => void;
type FormRenderListener = (form: HTMLElement, forEachElement: ForEachFormElement) => void;

const FORM_RENDER_EVENT = "library-thing-form-rendered";

const forEachFormElement: ForEachFormElement = (callback: (element: FormAreaElement) => void): void =>
	getFormElements().forEach(callback);

const listeners = new Map<FormRenderListener, () => void>();

const encloseCallbackArguments = (callback: FormRenderListener) => () => callback(getForm(), forEachFormElement);

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

window.addEventListener("load", () => {
	const editForm = getForm();
	if (editForm) {
		const tryToEmit = () => formExists() && window.dispatchEvent(new Event(FORM_RENDER_EVENT));
		new MutationObserver(tryToEmit).observe(editForm, {subtree: false, childList: true});
		tryToEmit();
	}
});

export type {ForEachFormElement, FormRenderListener};
export {onFormRender, offFormRender, onceFormRender};
