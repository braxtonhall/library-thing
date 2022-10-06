import {invokeWorker} from "../workers/invoker";
import {WorkerKind} from "../workers/types";
import {FORM_RENDER_EVENT} from "../constants";
import {showToast, ToastType} from "../ui/toast";
import {createLoader, removeLoader} from "../ui/loading-indicator";

const findTextContent = (id: string) => (): string =>
	(document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement)?.value ?? "";

const findTitle = findTextContent("form_title");

const findAuthor = findTextContent("form_authorunflip");

const onClick = (comments: HTMLTextAreaElement) => async (event: MouseEvent) => {
	event.preventDefault();
	const author = findAuthor();
	const title = findTitle();

	const {overlay, style} = createLoader();
	const links = await invokeWorker(WorkerKind.Finder, {author, title});
	removeLoader(overlay, style);

	const commentAddition = links.map((link) => `PDF: ${link}`).join("\n");
	if (commentAddition) {
		comments.value += `\n${commentAddition}`;
		comments.dispatchEvent(new Event("change"));
	} else {
		showToast("No PDFs found for this book", ToastType.WARNING);
	}
};

const createButton = (onClick: (event: MouseEvent) => void): HTMLButtonElement => {
	const button = document.createElement("button");
	button.innerHTML = "Find PDF";
	button.addEventListener("click", onClick);
	return button;
};

window.addEventListener(FORM_RENDER_EVENT, async () => {
	const commentsCell = document.getElementById("bookedit_comments");
	const comments = document.getElementById("form_comments") as HTMLTextAreaElement; // not type safe -- lazy

	if (commentsCell && comments) {
		commentsCell.appendChild(createButton(onClick(comments)));
	}
});
