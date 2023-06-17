import {FormAreaElement, FormData} from "./types";
import {getFormData} from "./data";

type OnSave = (callback: OnSaveListener) => void;
type OffSave = OnSave;
type OnConfirm = (callback: OnConfirmedListener) => void;
type OnSaveListener = () => Promise<boolean>;
type OnConfirmedListener = () => void;
type FormElementListener = (element: FormAreaElement) => void;
type OnFormElement = (callback: FormElementListener) => void;
type FormState = {
	onSave: OnSave;
	offSave: OffSave;
	onConfirm: OnConfirm;
	registerFormElement: FormElementListener;
	onFormElement: OnFormElement;
	getCleanFormData: () => FormData;
};

const maybeClick =
	(
		realButton: HTMLElement,
		clickedButton: HTMLElement,
		listeners: Set<OnSaveListener>,
		confirmListeners: Set<OnConfirmedListener>
	) =>
	async () =>
		Array.from(listeners.values())
			.reduce((promise, listener) => promise.then((result) => result && listener()), Promise.resolve(true))
			.then((result) => {
				if (result) {
					clickedButton.style.display = "none";
					confirmListeners.forEach((callback) => callback());
					realButton.dispatchEvent(new Event("click"));
				}
			});

const replaceButton = (
	button: HTMLElement,
	saveListeners: Set<OnSaveListener>,
	confirmListeners: Set<OnConfirmedListener>
) => {
	const td = document.createElement("td");
	td.className = button.className;
	td.style.cssText = button.style.cssText;
	td.innerHTML = button.innerHTML;
	td.addEventListener("click", maybeClick(button, td, saveListeners, confirmListeners));
	button.style.display = "none";
	button.insertAdjacentElement("beforebegin", td);
};

const createFormState = (): FormState => {
	const formData = getFormData();
	const listeners: Set<OnSaveListener> = new Set<OnSaveListener>();
	const confirmListeners: Set<OnConfirmedListener> = new Set<OnConfirmedListener>();
	const formElementListeners: Set<FormElementListener> = new Set<FormElementListener>();
	replaceButton(document.getElementById("book_editTabTextSave1"), listeners, confirmListeners);
	replaceButton(document.getElementById("book_editTabTextSave2"), listeners, confirmListeners);
	const onSave = (callback: OnSaveListener) => listeners.add(callback);
	const offSave = (callback: OnSaveListener) => listeners.delete(callback);
	const onConfirm = (callback: OnConfirmedListener) => confirmListeners.add(callback);
	const onFormElement = (callback: FormElementListener) => formElementListeners.add(callback);
	const registerFormElement = (formAreaElement: FormAreaElement) =>
		formElementListeners.forEach((callback) => callback(formAreaElement));
	return {onSave, offSave, onConfirm, onFormElement, registerFormElement, getCleanFormData: () => formData};
};

export type {OnSave, OffSave, OnConfirm, FormState, FormElementListener};
export {createFormState};
