import {formDataEquals, formExists, getFormData, onceFormRender, onFormRender} from "../entities/bookForm";

let listening: boolean;

const stopListening = () => (listening = false);

const addDeafenListener = () =>
	[
		document.getElementById("book_editTabTextEditCancel1"),
		document.getElementById("book_editTabTextEditCancel2"),
		document.getElementById("book_editTabTextSave1"),
		document.getElementById("book_editTabTextSave2"),
		document.getElementById("book_editTabTextDelete"), // so that it doesn't alert you when you're deleting something (?)
	].forEach((element) => element?.addEventListener("click", stopListening));

const onExit = (getCleanFormData) => (event: Event) => {
	if (listening && formExists() && !formDataEquals(getCleanFormData(), getFormData())) {
		event.returnValue = true;
		return (
			"It looks like you have been editing something. " + "If you leave before saving, your changes will be lost."
		);
	}
};

onceFormRender(({getCleanFormData}) => window.addEventListener("beforeunload", onExit(getCleanFormData)));
onFormRender(({onConfirm}) => {
	listening = true;
	addDeafenListener();
	onConfirm(stopListening);
});
