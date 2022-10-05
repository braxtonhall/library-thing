import {FORM_RENDER_EVENT} from "../constants";

const tryToEmit = () => {
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
