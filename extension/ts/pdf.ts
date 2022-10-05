import {invokeWorker} from "./workers/invoker";
import {WorkerKind} from "./workers/types";

const findTitle = (form: HTMLElement): string => {
	return "title";
};

const findAuthor = (form: HTMLElement): string => {
	return "author";
};

const onClick = (form: HTMLElement, comments: HTMLTextAreaElement) => async (event: MouseEvent) => {
	event.preventDefault();
	const author = findAuthor(form);
	const title = findTitle(form);
	const test = await invokeWorker(WorkerKind.Finder, {author, title});
	comments.textContent += JSON.stringify(test);
};

const createButton = (onClick: (event: MouseEvent) => void): HTMLButtonElement => {
	const button = document.createElement("button");
	button.innerHTML = "Find PDF";
	button.addEventListener("click", onClick);
	return button;
};

window.addEventListener("load", async () => {
	const form = document.getElementById("book_bit");
	const commentsCell = document.getElementById("bookedit_comments");
	const comments = document.getElementById("form_comments") as HTMLTextAreaElement; // not type safe -- lazy

	if (form && commentsCell && comments) {
		commentsCell.appendChild(createButton(onClick(form, comments)));
	}
});
