import "../../../sass/modal.sass";

import {createOverlay} from "./overlay";
import {UIColour} from "./colour";

interface ModalElement {
	kind: string;
	text: string;
	colour: UIColour;
}

interface ModalButton extends ModalElement {
	kind: "button";
	onClick?: () => Promise<void>;
}

interface ModalInput extends ModalElement {
	kind: "input";
	placeholder: string;
	ensureNonEmpty: boolean;
	onSelect: (userText: string) => Promise<void>;
}

interface ModalOptions {
	text: string;
	subText?: string[];
	elements: (ModalButton | ModalInput)[];
	onCancel?: () => Promise<void>;
	colour: UIColour;
	exitable?: boolean;
	id?: string;
}

const MODAL_CLASS_NAME = "better-library-thing-modal";
const MODAL_TEXT_CLASS_NAME = "better-library-thing-modal-text-container";
const MODAL_MAIN_TEXT_CLASS_NAME = "better-library-thing-modal-main-text";
const MODAL_SUB_TEXT_CLASS_NAME = "better-library-thing-modal-sub-text";
const MODAL_BUTTON_CLASS_NAME = "better-library-thing-modal-button";
const MODAL_INPUT_CLASS_NAME = "better-library-thing-modal-input";
const MODAL_INPUT_CONTAINER_CLASS_NAME = "better-library-thing-modal-input-container";
const MODAL_ELEMENT_CONTAINER_CLASS_NAME = "better-library-thing-modal-element-container";
const MODAL_ID_ATTR = "modal-id";
const DEFAULT_ID = "_unset";

const activeModals = new Map<HTMLElement, () => Promise<void>>();

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

const createModalButton = (exit: () => void, {text, onClick, colour}: ModalButton) => {
	const button = createWithClass("button", `${MODAL_BUTTON_CLASS_NAME} ${colour}`);
	button.innerText = text;
	addOnClick(button, exit, onClick);
	return button;
};

const createModalInput = (exit: () => void, {text, onSelect, colour, ensureNonEmpty, placeholder}: ModalInput) => {
	const input = createWithClass("input", `${MODAL_INPUT_CLASS_NAME} ${colour}`);
	input.placeholder = placeholder;
	const decoratedExit = ensureNonEmpty
		? () => input.value && onSelect(input.value).finally(exit)
		: () => onSelect(input.value).finally(exit);
	const button = createModalButton(decoratedExit, {text, colour, kind: "button"});
	if (ensureNonEmpty) {
		button.disabled = true;
		input.addEventListener("keyup", () => {
			button.disabled = !input.value;
		});
	}
	const container = createWithClass("div", `${MODAL_INPUT_CONTAINER_CLASS_NAME} ${colour}`);
	container.append(input, button);
	return container;
};

const createModalElement = (exit: () => void) => (element: ModalButton | ModalInput) => {
	if (element.kind === "button") {
		return createModalButton(exit, element);
	} else {
		return createModalInput(exit, element);
	}
};

const createTextContainer = (text: string, subTexts?: string[]) => {
	const container = createWithClass("div", MODAL_TEXT_CLASS_NAME);
	container.append(createWithClass("span", MODAL_MAIN_TEXT_CLASS_NAME, text));
	if (subTexts && subTexts.length > 0) {
		container.append(...subTexts.map((subText) => createWithClass("p", MODAL_SUB_TEXT_CLASS_NAME, subText)));
	}
	return container;
};

const createOnClick = (exit: () => void, onClick?: () => Promise<void>) => {
	const callback = onClick ?? (() => Promise.resolve());
	return () => callback().finally(exit);
};

const addOnClick = (element: HTMLElement, exit: () => void, onClick?: () => Promise<void>) =>
	element.addEventListener("click", createOnClick(exit, onClick));

const dismissModals = (id = DEFAULT_ID): void =>
	activeModals.forEach((onCancel, modal) => modal.getAttribute(MODAL_ID_ATTR) === id && onCancel());

const createDismissal = (overlay: HTMLElement) => () => {
	activeModals.delete(overlay);
	overlay.remove();
};

const decorateOverlay = (
	overlay: HTMLElement,
	id: string,
	exitable: boolean,
	dismiss: () => void,
	onCancel?: () => Promise<void>
) => {
	const onExit = createOnClick(dismiss, onCancel);
	overlay.classList.add("modal");
	overlay.setAttribute(MODAL_ID_ATTR, id);
	if (exitable) {
		overlay.classList.add("exitable");
		overlay.addEventListener("click", onExit);
	}
	activeModals.set(overlay, onExit);
};

const createModal = ({
	text,
	subText,
	elements,
	onCancel,
	colour,
	exitable = true,
	id = DEFAULT_ID,
}: ModalOptions): void => {
	const overlay = createOverlay();
	const dismiss = createDismissal(overlay);

	decorateOverlay(overlay, id, exitable, dismiss, onCancel);

	const modal = createWithClass("div", `${MODAL_CLASS_NAME} ${colour}`);
	modal.addEventListener("click", (event) => event.stopPropagation());

	const textContainer = createTextContainer(text, subText);

	const elementContainer = createWithClass("div", MODAL_ELEMENT_CONTAINER_CLASS_NAME);
	const modalElements = elements.map(createModalElement(dismiss));

	elementContainer.append(...modalElements);
	modal.append(textContainer, elementContainer);
	overlay.append(modal);
	document.body.appendChild(overlay);
};

export {createModal, dismissModals};
