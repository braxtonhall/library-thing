enum ModalColour {
	GREEN = "green",
	AMBER = "amber",
	BLUE = "blue",
	RED = "red",
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
	buttons: ModalButton[];
	onCancel: () => Promise<void>;
	colour: ModalColour;
}

const OVERLAY_CLASS_NAME = "better-library-thing-modal-overlay";
const MODAL_CLASS_NAME = "better-library-thing-modal";
const MODAL_TEXT_CLASS_NAME = "better-library-thing-modal";
const MODAL_BUTTON_CLASS_NAME = "better-library-thing-modal-button";
const MODAL_BUTTON_CONTAINER_CLASS_NAME = "better-library-thing-modal-button";

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

const createModal = ({text, buttons, onCancel, colour}: ModalOptions): void => {
	const exit = () => document.body.removeChild(overlay);

	const overlay = createWithClass("div", OVERLAY_CLASS_NAME);
	overlay.addEventListener("click", () => onCancel().finally(exit));
	const modal = createWithClass("div", `${MODAL_CLASS_NAME} ${colour}`);
	const span = createWithClass("span", MODAL_TEXT_CLASS_NAME, text);
	const buttonContainer = createWithClass("div", MODAL_BUTTON_CONTAINER_CLASS_NAME);
	const buttonElements = buttons.map(createButton(exit));

	buttonContainer.append(...buttonElements);
	modal.append(span, buttonContainer);
	overlay.append(modal);
	document.body.appendChild(overlay);
};

export {createModal, ModalColour};
