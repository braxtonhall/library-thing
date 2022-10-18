import "../../sass/modal.sass";

import {createOverlay} from "./overlay";

enum ModalColour {
	RED = "red",
	AMBER = "amber",
	GREEN = "green",
	BLUE = "blue",
	PURPLE = "purple",
	GREY = "grey",
}

interface ModalButton {
	text: string;
	onClick: () => Promise<void>;
	colour: ModalColour;
}

interface ModalOptions {
	text: string;
	subText?: string;
	buttons: ModalButton[];
	onCancel: () => Promise<void>;
	colour: ModalColour;
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
		button.addEventListener("click", async () => onClick().finally(exit));
		return button;
	};

const createTextContainer = (text: string, subText?: string) => {
	const container = createWithClass("div", MODAL_TEXT_CLASS_NAME);
	container.append(createWithClass("span", MODAL_MAIN_TEXT_CLASS_NAME, text));
	if (subText) {
		container.append(createWithClass("p", MODAL_SUB_TEXT_CLASS_NAME, subText));
	}
	return container;
};

const createModal = ({text, subText, buttons, onCancel, colour}: ModalOptions): void => {
	const exit = () => document.body.removeChild(overlay);

	const overlay = createOverlay();
	overlay.className += " modal";
	overlay.addEventListener("click", () => onCancel().finally(exit));

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

export {createModal, ModalColour};
