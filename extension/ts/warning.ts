import { RELEVANT_TAGS } from "./constants";
import { getElementsByTags } from "./util";

let edited = false;

const onEdit = () => (edited = true);

const undoEdits = () => (edited = false);

const addEditListener = (parent: HTMLElement) =>
	getElementsByTags(parent, RELEVANT_TAGS).forEach((element) => {
		element.addEventListener("change", onEdit);
		element.addEventListener("keydown", onEdit);
	});

const observer = new MutationObserver((mutations) => {
	/**
	 * This potentially means things are added same listener to the same node multiple times,
	 * but who cares if we set the edited boolean as true 8 times lmao
	 */
	addUndoEditListener();
	mutations.forEach((mutation) =>
		mutation.addedNodes.forEach(addEditListener)
	);
});

const addUndoEditListener = () =>
	[
		document.getElementById("book_editTabTextEditCancel1"),
		document.getElementById("book_editTabTextEditCancel2"),
		document.getElementById("book_editTabTextSave1"),
		document.getElementById("book_editTabTextSave2"),
		document.getElementById("book_editTabTextDelete"), // so that it doesn't alert you when you're deleting something (?)
	].forEach((element) => element?.addEventListener("click", undoEdits));

window.addEventListener("load", () => {
	const editForm = document.getElementById("book_editForm");
	if (editForm) {
		observer.observe(editForm, { subtree: true, childList: true });
		addEditListener(editForm);

		addUndoEditListener();

		window.addEventListener("beforeunload", (event) => {
			if (edited) {
				const confirmationMessage =
					"It looks like you have been editing something. " +
					"If you leave before saving, your changes will be lost.";

				(event || window.event).returnValue = confirmationMessage; // Gecko + IE
				return confirmationMessage; // Gecko + Webkit, Safari, Chrome etc.
			}
		});
	}
});
