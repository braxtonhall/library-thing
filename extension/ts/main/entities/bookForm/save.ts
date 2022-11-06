type OnSave = (callback: OnSaveListener) => void;
type OnSaveListener = () => Promise<boolean>;

const maybeClick = (realButton: HTMLElement, clickedButton: HTMLElement, listeners: OnSaveListener[]) => async () => {
	const futureApprovals = listeners.map((listener) => listener());
	const approvals = await Promise.all(futureApprovals);
	if (approvals.every((approval) => approval)) {
		clickedButton.style.display = "none";
		realButton.dispatchEvent(new Event("click"));
	}
};

const replaceButton = (button: HTMLElement, listeners: OnSaveListener[]) => {
	const td = document.createElement("td");
	td.className = button.className;
	td.style.cssText = button.style.cssText;
	td.innerHTML = button.innerHTML;
	td.addEventListener("click", maybeClick(button, td, listeners));
	button.style.display = "none";
	button.insertAdjacentElement("beforebegin", td);
};

const createOnSave = (): OnSave => {
	const listeners: OnSaveListener[] = [];
	replaceButton(document.getElementById("book_editTabTextSave1"), listeners);
	replaceButton(document.getElementById("book_editTabTextSave2"), listeners);
	return (callback: OnSaveListener) => listeners.push(callback);
};

export type {OnSave};
export {createOnSave};
