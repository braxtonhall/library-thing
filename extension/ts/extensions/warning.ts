import {FORM_RENDER_EVENT} from "../services/renderFormObserver";
import {getFormElements} from "../util/bookForm";

let edited = false;

const onEdit = () => (edited = true);

const undoEdits = () => (edited = false);

const addEditListener = () =>
	getFormElements().forEach((element) => {
		element.addEventListener("change", onEdit);
		element.addEventListener("keydown", onEdit);
	});

const addUndoEditListener = () =>
	[
		document.getElementById("book_editTabTextEditCancel1"),
		document.getElementById("book_editTabTextEditCancel2"),
		document.getElementById("book_editTabTextSave1"),
		document.getElementById("book_editTabTextSave2"),
		document.getElementById("book_editTabTextDelete"), // so that it doesn't alert you when you're deleting something (?)
	].forEach((element) => element?.addEventListener("click", undoEdits));

window.addEventListener(FORM_RENDER_EVENT, () => {
	addEditListener();
	addUndoEditListener();
});

window.addEventListener("beforeunload", (event) => {
	if (edited) {
		const confirmationMessage =
			"It looks like you have been editing something. " +
			"If you leave before saving, your changes will be lost.";

		(event || window.event).returnValue = confirmationMessage; // Gecko + IE
		return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
	}
});
