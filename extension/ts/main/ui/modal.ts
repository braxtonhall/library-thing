import "../../../sass/modal.sass";

import {createOverlay} from "./overlay";
import {UIColour} from "./colour";

interface ModalButton {
	text: string;
	onClick?: () => Promise<void>;
	colour: UIColour;
}

interface ModalOptions {
	text: string;
	subText?: string[];
	buttons: ModalButton[];
	onCancel?: () => Promise<void>;
	colour: UIColour;
}

const MODAL_CLASS_NAME = "better-library-thing-modal";
const MODAL_TEXT_CLASS_NAME = "better-library-thing-modal-text-container";
const MODAL_MAIN_TEXT_CLASS_NAME = "better-library-thing-modal-main-text";
const MODAL_SUB_TEXT_CLASS_NAME = "better-library-thing-modal-sub-text";
const MODAL_BUTTON_CLASS_NAME = "better-library-thing-modal-button";
const MODAL_BUTTON_CONTAINER_CLASS_NAME = "better-library-thing-modal-button-container";

const createWithClass = <K extends keyof HTMLElementTagNameMap>(
	tag: K,
	className: string,
	text?: string
): HTMLElementTagNameMap[K] => {
	const element = document.createElement(tag);
	element.className = className;
	text && (element.innerText = text);
	return element;
};

const createButton =
	(exit: () => void) =>
	({text, onClick, colour}: ModalButton) => {
		const button = createWithClass("button", `${MODAL_BUTTON_CLASS_NAME} ${colour}`);
		button.innerText = text;
		addOnClick(button, exit, onClick);
		return button;
	};

const createTextContainer = (text: string, subTexts?: string[]) => {
	const container = createWithClass("div", MODAL_TEXT_CLASS_NAME);
	container.append(createWithClass("span", MODAL_MAIN_TEXT_CLASS_NAME, text));
	if (subTexts && subTexts.length > 0) {
		container.append(...subTexts.map((subText) => createWithClass("p", MODAL_SUB_TEXT_CLASS_NAME, subText)));
	}
	return container;
};

const addOnClick = (element: HTMLElement, exit: () => void, onClick?: () => Promise<void>) => {
	const callback = onClick ?? (() => Promise.resolve());
	element.addEventListener("click", () => callback().finally(exit));
};

const createModal = ({text, subText, buttons, onCancel, colour}: ModalOptions): void => {
	const exit = () => document.body.removeChild(overlay);

	const overlay = createOverlay();
	overlay.className += " modal";
	addOnClick(overlay, exit, onCancel);

	const modal = createWithClass("div", `${MODAL_CLASS_NAME} ${colour}`);
	modal.addEventListener("click", (event) => event.stopPropagation());

	const textContainer = createTextContainer(text, subText);

	const buttonContainer = createWithClass("div", MODAL_BUTTON_CONTAINER_CLASS_NAME);
	const buttonElements = buttons.map(createButton(exit));

	buttonContainer.append(...buttonElements);
	modal.append(textContainer, buttonContainer);
	overlay.append(modal);
	document.body.appendChild(overlay);
};

export {createModal};
