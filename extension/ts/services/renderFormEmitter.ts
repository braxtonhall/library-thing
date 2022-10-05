import {FORM_RENDER_EVENT} from "../constants";

const tryToEmit = () => {
	// This is relying on the fact that when the edit form is available, the html matches this selector,
	// and fails to match in all other cases. This IS brittle. If LibraryThing changes
	// the markup in any way this will just not work
	if (document.querySelector("#book_editForm > .book_bit")) {
		window.dispatchEvent(new Event(FORM_RENDER_EVENT));
	}
};

const observer = new MutationObserver(tryToEmit);

window.addEventListener("load", () => {
	const editForm = document.getElementById("book_editForm");
	if (editForm) {
		observer.observe(editForm, {subtree: false, childList: true});
		tryToEmit();
	}
});
