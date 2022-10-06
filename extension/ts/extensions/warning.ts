import {ForEachFormElement, FormData, formDataEquals, getFormData, onFormRender} from "../objects/bookForm";

let edited: boolean;
let storedFormData: FormData;

const onEdit = () => (edited = true);

const undoEdits = () => {
	storedFormData = getFormData();
	edited = false;
};

const addEditListener = (element: Element) => {
	element.addEventListener("change", onEdit);
	element.addEventListener("keydown", onEdit);
};

const addUndoEditListener = () =>
	[
		document.getElementById("book_editTabTextEditCancel1"),
		document.getElementById("book_editTabTextEditCancel2"),
		document.getElementById("book_editTabTextSave1"),
		document.getElementById("book_editTabTextSave2"),
		document.getElementById("book_editTabTextDelete"), // so that it doesn't alert you when you're deleting something (?)
	].forEach((element) => element?.addEventListener("click", undoEdits));

onFormRender((_, forEachElement: ForEachFormElement) => {
	undoEdits();
	forEachElement(addEditListener);
	addUndoEditListener();
});

window.addEventListener("beforeunload", (event) => {
	if (edited && !formDataEquals(storedFormData, getFormData())) {
		const confirmationMessage =
			"It looks like you have been editing something. " +
			"If you leave before saving, your changes will be lost.";

		(event || window.event).returnValue = confirmationMessage; // Gecko + IE
		return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
	}
});
