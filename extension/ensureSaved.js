let edited = false;

const relevantTags = ["textarea", "input", "select"];

const onEdit = () => {
	edited = true
};

const undoEdits = () => {
	edited = false;
};

const addListener = (element) => {
	element.addEventListener("change", onEdit);
	element.addEventListener("keydown", onEdit);
};

const removeListener = (element) => {
	element.removeListener("change", onEdit);
	element.removeListener("keydown", onEdit);
};

const editListenersFrom = (parent, update) => () => {
	const editableElements = getElementsByTags(parent, relevantTags);
	editableElements.forEach(update);
};

const addOnEditClicked = (element) =>
	element.addEventListener("click", undoEdits);

const observer = new MutationObserver((mutations) => {
	addOnCancelEditButton();
	mutations.forEach((mutation) =>
		mutation.addedNodes.forEach((node) => {
			editListenersFrom(node, addListener)();
		}));
});

const addOnCancelEditButton = () => [
	document.getElementById("book_editTabTextEditCancel1"),
	document.getElementById("book_editTabTextEditCancel2"),
	document.getElementById("book_editTabTextSave1"),
	document.getElementById("book_editTabTextSave2"),
	document.getElementById("book_editTabTextDelete"), // there's only one of these, so that it doesn't alert you when you're deleting something (?)
].forEach(addOnEditClicked);

window.addEventListener("load", () => {

	const editWindow = document.getElementById("book_editForm");

	const addAllListeners = editListenersFrom(editWindow, addListener);

	addOnCancelEditButton()

	observer.observe(document.querySelector("#book_editForm"), { subtree: true, childList: true });

	addAllListeners();

	window.addEventListener("beforeunload", (event) => {
		if (edited) {
			const confirmationMessage = 'It looks like you have been editing something. '
			+ 'If you leave before saving, your changes will be lost.';

			(event || window.event).returnValue = confirmationMessage; //Gecko + IE
			return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
		}
	});
});
