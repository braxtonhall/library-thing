import {formExists, getForm} from "../util/bookForm";

const FORM_RENDER_EVENT = "library-thing-form-rendered";

const tryToEmit = () => {
	if (formExists()) {
		window.dispatchEvent(new Event(FORM_RENDER_EVENT));
	}
};

const observer = new MutationObserver(tryToEmit);

window.addEventListener("load", () => {
	const editForm = getForm();
	if (editForm) {
		observer.observe(editForm, {subtree: false, childList: true});
		tryToEmit();
	}
});

export {FORM_RENDER_EVENT};
