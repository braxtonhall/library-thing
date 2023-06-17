import {FormData, formDataEquals, formExists, getFormData, onceFormRender, onFormRender} from "../entities/bookForm";

let storedFormData: FormData;

const undoEdits = () => (storedFormData = getFormData());

const addUndoEditListener = () =>
	[
		document.getElementById("book_editTabTextEditCancel1"),
		document.getElementById("book_editTabTextEditCancel2"),
		document.getElementById("book_editTabTextSave1"),
		document.getElementById("book_editTabTextSave2"),
		document.getElementById("book_editTabTextDelete"), // so that it doesn't alert you when you're deleting something (?)
	].forEach((element) => element?.addEventListener("click", undoEdits));

const onExit = (event: Event) => {
	if (formExists() && !formDataEquals(storedFormData, getFormData())) {
		event.returnValue = true;
		return (
			"It looks like you have been editing something. " + "If you leave before saving, your changes will be lost."
		);
	}
};

const addUnloadListener = () => window.addEventListener("beforeunload", onExit);

onceFormRender(addUnloadListener);
onFormRender(({onConfirm}) => {
	undoEdits();
	addUndoEditListener();
	onConfirm(undoEdits);
});
