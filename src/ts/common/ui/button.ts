import {tooltipped} from "./tooltip";
import * as browser from "webextension-polyfill";

const decorateWithDescription = <T extends HTMLElement>(button: T, description?: string): T => {
	if (description) {
		return tooltipped(button, {text: description});
	} else {
		return button;
	}
};

// semantically, this isn't actually a button, but who am i to question the choices of LibraryThing
const createIconButton = (
	buttonText: string,
	imgSrc: string,
	onClick: (event: MouseEvent) => void,
	description?: string
): HTMLTableCellElement => {
	const td = document.createElement("td");
	td.className = "book_bitItem";
	td.style.paddingLeft = "8px";
	const img = document.createElement("img");
	img.src = browser.runtime.getURL(imgSrc);
	const span = document.createElement("span");
	span.innerHTML = buttonText;
	span.className = "book_editTabText";
	span.style.color = "#6A5546";
	td.addEventListener("click", onClick);
	const imgTd = document.createElement("td");
	imgTd.append(img);
	imgTd.style.paddingRight = "4px";
	const spanTd = document.createElement("td");
	spanTd.append(span);
	td.appendChild(imgTd);
	td.appendChild(spanTd);
	return decorateWithDescription(td, description);
};

export {createIconButton};
