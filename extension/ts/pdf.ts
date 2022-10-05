import {invokeWorker} from "./workers/invoker";
import {WorkerKind} from "./workers/types";

const findTextContent = (id: string) =>
	(): string => (document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement)?.value ?? "";

const findTitle = findTextContent("form_authorunflip");

const findAuthor = findTextContent("form_title");

const onClick = (comments: HTMLTextAreaElement) => async (event: MouseEvent) => {
	event.preventDefault();
	const author = findAuthor();
	const title = findTitle();

	console.log(title);

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
	const commentsCell = document.getElementById("bookedit_comments");
	const comments = document.getElementById("form_comments") as HTMLTextAreaElement; // not type safe -- lazy

	if (commentsCell && comments) {
		commentsCell.appendChild(createButton(onClick(comments)));
	}
});
