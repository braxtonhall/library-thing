import {FormAreaElement} from "./types";
import {formExists, getForm, getFormElementsFromSubtree} from "./util";
import {createFormState, FormState, OffSave, OnConfirm, OnSave} from "./state";
import {getFormDataElements} from "./data";

type ForEachFormElement = (callback: (element: FormAreaElement) => void) => void;
type FormRenderEnvironment = {
	form: HTMLElement;
	forEachElement: ForEachFormElement;
	onSave: OnSave;
	offSave: OffSave;
	onConfirm: OnConfirm;
};
type FormRenderListener = (env: FormRenderEnvironment) => void;

const FORM_RENDER_EVENT = "library-thing-form-rendered";
const FORM_REMOVED_EVENT = "library-thing-form-removed";

const forEachFormElement: ForEachFormElement = (callback: (element: FormAreaElement) => void): void => {
	getFormDataElements(document).forEach(callback);
	state.onFormElement(callback);
};

const listeners = new Map<FormRenderListener, () => void>();
// kinda gross but i don't have a better idea without a bIG refactor
let state: FormState;

const encloseCallbackArguments = (callback: FormRenderListener) => () =>
	callback({
		form: getForm(document),
		forEachElement: forEachFormElement,
		onSave: state.onSave,
		offSave: state.offSave,
		onConfirm: state.onConfirm,
	});

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

const onFormRemoved = (callback: () => void): void => window.addEventListener(FORM_REMOVED_EVENT, callback);
const offFormRemoved = (callback: () => void): void => window.removeEventListener(FORM_REMOVED_EVENT, callback);
const onceFormRemoved = (callback: () => void): void =>
	window.addEventListener(FORM_REMOVED_EVENT, callback, {once: true});

const handleFormMutation = () => {
	if (formExists()) {
		state = createFormState();
		window.dispatchEvent(new Event(FORM_RENDER_EVENT));
	} else {
		window.dispatchEvent(new Event(FORM_REMOVED_EVENT));
	}
};

window.addEventListener("pageshow", () => {
	const editForm = getForm(document);
	if (editForm) {
		new MutationObserver(handleFormMutation).observe(editForm, {childList: true});
		new MutationObserver((mutations) => {
			mutations.forEach((mutation) =>
				mutation.addedNodes.forEach(
					(node) =>
						node instanceof HTMLElement &&
						getFormElementsFromSubtree(node).forEach(state.registerFormElement)
				)
			);
		}).observe(editForm, {subtree: true, childList: true});
		handleFormMutation();
	}
});

export type {ForEachFormElement, FormRenderListener};
export {onFormRender, offFormRender, onceFormRender, onFormRemoved, onceFormRemoved, offFormRemoved};
