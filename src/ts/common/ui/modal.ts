import "../../../sass/modal.sass";

import {createOverlay} from "./overlay";
import {UIColour} from "./colour";

type BaseModalElement = {
	text: string;
	colour: UIColour;
};

type ModalButton = BaseModalElement & {
	kind: "button";
	onClick?: () => Promise<void>;
};

type ModalInput = BaseModalElement & {
	kind: "input";
	placeholder: string;
	ensureNonEmpty: boolean;
	onSelect: (userText: string) => Promise<void>;
};

type ModalElement = ModalButton | ModalInput;

interface ModalOptions {
	text: string;
	subText?: string[];
	elements: ModalElement[];
	onCancel?: () => Promise<void>;
	colour: UIColour;
	/**
	 * Whether a user can exit the modal by clicking outside it
	 */
	exitable?: boolean;
	/**
	 * A name for the modal that can be used to programmatically query for it
	 */
	tag?: string;
}

type DismissModal = () => Promise<void>;

const MODAL_CLASS_NAME = "better-library-thing-modal";
const MODAL_TEXT_CLASS_NAME = "better-library-thing-modal-text-container";
const MODAL_MAIN_TEXT_CLASS_NAME = "better-library-thing-modal-main-text";
const MODAL_SUB_TEXT_CLASS_NAME = "better-library-thing-modal-sub-text";
const MODAL_BUTTON_CLASS_NAME = "better-library-thing-modal-button";
const MODAL_INPUT_CLASS_NAME = "better-library-thing-modal-input";
const MODAL_INPUT_CONTAINER_CLASS_NAME = "better-library-thing-modal-input-container";
const MODAL_ELEMENT_CONTAINER_CLASS_NAME = "better-library-thing-modal-element-container";
const MODAL_TAG_ATTR = "modal-tag";
const DEFAULT_MODAL_TAG = "_unset";

/**
 * Essentially a set of all active modals.
 * Also stores its "dismiss" callback, which can be invoked to
 * dismiss the modal.
 * REQUIRES that `DismissModal` will actually delete/deregister the modal
 */
const activeModals = new Map<HTMLElement, DismissModal>();

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

const createModalElement = (exit: () => void) => (element: ModalElement) => {
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

const createDismissModal = (exit: () => void, onClick?: () => Promise<void>): DismissModal => {
	const callback = onClick ?? (() => Promise.resolve());
	return () => callback().finally(exit);
};

const addOnClick = (element: HTMLElement, exit: () => void, onClick?: () => Promise<void>) =>
	element.addEventListener("click", createDismissModal(exit, onClick));

/**
 * Saves the modal so that its dismiss callback can be invoked when
 *  it is dismissed via `dismissModals`
 * @param modal - The HTML tree that implements the modal
 * @param dismissal - The function that will dismiss the modal
 */
const registerModal = (modal: HTMLElement, dismissal: DismissModal): void => void activeModals.set(modal, dismissal);

/**
 * Removes a modal from the list of active modals
 * This modal can no longer be dismissed via `dismissModals`
 * @param modal
 */
const deregisterModal = (modal: HTMLElement): void => void activeModals.delete(modal);

/**
 * For each modal matching the `tag`, invoke its dismiss function (which should dismiss it)
 * @param tag - Identifier used to query the set of modals for a subset which should be dismissed
 */
const dismissModals = (tag = DEFAULT_MODAL_TAG): void =>
	activeModals.forEach((dismiss, modal) => modal.getAttribute(MODAL_TAG_ATTR) === tag && dismiss());

const createExitModal = (modal: HTMLElement) => () => {
	deregisterModal(modal);
	modal.remove();
};

const decorateOverlay = (overlay: HTMLElement, id: string, exitable: boolean, dismissModal: DismissModal) => {
	overlay.classList.add("modal");
	overlay.setAttribute(MODAL_TAG_ATTR, id);
	if (exitable) {
		overlay.classList.add("exitable");
		overlay.addEventListener("click", dismissModal);
	}
};

const createModal = ({
	text,
	subText,
	elements,
	onCancel,
	colour,
	exitable = true,
	tag = DEFAULT_MODAL_TAG,
}: ModalOptions): void => {
	const overlay = createOverlay();
	const exitModal = createExitModal(overlay);

	const defaultDismissal = createDismissModal(exitModal, onCancel);
	decorateOverlay(overlay, tag, exitable, defaultDismissal);
	registerModal(overlay, defaultDismissal);

	const modal = createWithClass("div", `${MODAL_CLASS_NAME} ${colour}`);
	modal.addEventListener("click", (event) => event.stopPropagation());

	const textContainer = createTextContainer(text, subText);

	const elementContainer = createWithClass("div", MODAL_ELEMENT_CONTAINER_CLASS_NAME);
	const modalElements = elements.map(createModalElement(exitModal));

	elementContainer.append(...modalElements);
	modal.append(textContainer, elementContainer);
	overlay.append(modal);
	document.body.appendChild(overlay);
};

export type {ModalButton, ModalInput};
export {createModal, dismissModals};
