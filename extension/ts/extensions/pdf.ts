import {showToast, ToastType} from "../ui/toast";
import {createLoader, removeLoader} from "../ui/loadingIndicator";
import {FORM_RENDER_EVENT} from "../services/renderFormObserver";
import {find} from "../services/finder/finder";
import {createButton} from "../ui/button";

const findTextContent = (id: string) => (): string =>
	(document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement)?.value ?? "";

const findTitle = findTextContent("form_title");

const findAuthor = findTextContent("form_authorunflip");

const onClick = (comments: HTMLTextAreaElement) => async (event: MouseEvent) => {
	event.preventDefault();
	const author = findAuthor();
	const title = findTitle();

	const overlay = createLoader();
	const links = await find({author, title});
	removeLoader(overlay);

	if (links.length > 0) {
		const commentAddition = links.map((link) => `PDF: ${link}`).join("\n");
		comments.value += `\n${commentAddition}`;
		comments.dispatchEvent(new Event("change"));
		showToast(`Found ${links.length} PDF${links.length > 1 ? "s" : ""}!`, ToastType.SUCCESS);
	} else {
		showToast("No PDFs found for this book", ToastType.WARNING);
	}
};

window.addEventListener(FORM_RENDER_EVENT, async () => {
	const commentsCell = document.getElementById("bookedit_comments");
	const comments = document.getElementById("form_comments") as HTMLTextAreaElement; // not type safe -- lazy

	if (commentsCell && comments) {
		commentsCell.appendChild(createButton("Find PDF", "img/search.png", onClick(comments)));
	}
});
