import {onFormRender} from "./listeners";

const maybeClick = (realButton: HTMLElement, clickedButton: HTMLElement) => async () => {
	const futureApprovals = listeners.map((listener) => listener());
	const approvals = await Promise.all(futureApprovals);
	if (approvals.every((approval) => approval)) {
		clickedButton.style.display = "none";
		realButton.dispatchEvent(new Event("click"));
	}
};

const replaceButton = (button: HTMLElement) => {
	const td = document.createElement("td");
	td.className = button.className;
	td.style.cssText = button.style.cssText;
	td.innerHTML = button.innerHTML;
	td.addEventListener("click", maybeClick(button, td));
	button.style.display = "none";
	button.insertAdjacentElement("beforebegin", td);
};

const listeners = [];

onFormRender(() => {
	replaceButton(document.getElementById("book_editTabTextSave1"));
	replaceButton(document.getElementById("book_editTabTextSave2"));
});

const onSave = (callback: () => Promise<boolean>) => listeners.push(callback);

export {onSave};
