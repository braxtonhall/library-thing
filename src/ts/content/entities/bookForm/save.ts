type OnSave = (callback: OnSaveListener) => void;
type OffSave = OnSave;
type OnConfirm = (callback: OnConfirmedListener) => void;
type OnSaveListener = () => Promise<boolean>;
type OnConfirmedListener = () => void;

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

const createOnSave = (): {onSave: OnSave; offSave: OffSave; onConfirm: OnConfirm} => {
	const listeners: Set<OnSaveListener> = new Set<OnSaveListener>();
	const confirmListeners: Set<OnConfirmedListener> = new Set<OnConfirmedListener>();
	replaceButton(document.getElementById("book_editTabTextSave1"), listeners, confirmListeners);
	replaceButton(document.getElementById("book_editTabTextSave2"), listeners, confirmListeners);
	const onSave = (callback: OnSaveListener) => listeners.add(callback);
	const offSave = (callback: OnSaveListener) => listeners.delete(callback);
	const onConfirm = (callback: OnConfirmedListener) => confirmListeners.add(callback);
	return {onSave, offSave, onConfirm};
};

export type {OnSave, OffSave, OnConfirm};
export {createOnSave};
