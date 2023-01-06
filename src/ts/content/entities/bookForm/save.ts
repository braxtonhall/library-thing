type OnSave = (callback: OnSaveListener) => void;
type OffSave = OnSave;
type OnSaveListener = () => Promise<boolean>;

const maybeClick = (realButton: HTMLElement, clickedButton: HTMLElement, listeners: Set<OnSaveListener>) => async () =>
	Array.from(listeners.values())
		.reduce((promise, listener) => promise.then((result) => result && listener()), Promise.resolve(true))
		.then((result) => {
			if (result) {
				clickedButton.style.display = "none";
				realButton.dispatchEvent(new Event("click"));
			}
		});

const replaceButton = (button: HTMLElement, listeners: Set<OnSaveListener>) => {
	const td = document.createElement("td");
	td.className = button.className;
	td.style.cssText = button.style.cssText;
	td.innerHTML = button.innerHTML;
	td.addEventListener("click", maybeClick(button, td, listeners));
	button.style.display = "none";
	button.insertAdjacentElement("beforebegin", td);
};

const createOnSave = (): {onSave: OnSave; offSave: OffSave} => {
	const listeners: Set<OnSaveListener> = new Set<OnSaveListener>();
	replaceButton(document.getElementById("book_editTabTextSave1"), listeners);
	replaceButton(document.getElementById("book_editTabTextSave2"), listeners);
	const onSave = (callback: OnSaveListener) => listeners.add(callback);
	const offSave = (callback: OnSaveListener) => listeners.delete(callback);
	return {onSave, offSave};
};

export type {OnSave, OffSave};
export {createOnSave};
