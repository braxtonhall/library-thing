import {createModal, ModalButton, ModalInput} from "./modal";
import {UIColour} from "./colour";

interface DialogOptions<E extends DialogElement[]> {
	text: string;
	subText?: string[];
	elements: E;
	colour: UIColour;
}

type DialogButton = Omit<ModalButton, "onClick"> & {id: string};
type DialogInput = Omit<ModalInput, "onSelect"> & {id: string};
type DialogElement = DialogButton | DialogInput;

type SelectionResponse<Selection extends DialogElement> = Selection extends DialogInput
	? {kind: DialogResponseKind.Input; id: string; value: string}
	: Selection extends DialogButton
	? {kind: DialogResponseKind.Button; id: string}
	: {kind: DialogResponseKind};

type DefaultResponse = {kind: DialogResponseKind.Cancelled};

enum DialogResponseKind {
	Cancelled = "cancelled",
	Button = "button",
	Input = "input",
}

const getButtonHandler = (resolve: (response) => void, id: string) => ({
	onClick: async () => resolve({kind: DialogResponseKind.Button, id}),
});

const getInputHandler = (resolve: (response) => void, id: string) => ({
	onSelect: async (userText: string) => resolve({kind: DialogResponseKind.Input, id, value: userText}),
});

const createModalElement =
	(resolve: (response) => void) =>
	(element: DialogElement): ModalInput | ModalButton => {
		return {
			...element,
			...(element.kind === "button" && getButtonHandler(resolve, element.id)),
			...(element.kind === "input" && getInputHandler(resolve, element.id)),
		};
	};

const dialog = <E extends DialogElement[]>(options: DialogOptions<E>) =>
	new Promise<SelectionResponse<E[number]> | DefaultResponse>((resolve) =>
		createModal({
			...options,
			elements: options.elements.map(createModalElement(resolve)),
			onCancel: async () => resolve({kind: DialogResponseKind.Cancelled}),
		})
	);

export {DialogButton, DialogInput};
export {dialog};
