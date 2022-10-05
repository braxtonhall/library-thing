import {invokeWorker} from "./workers/invoker";
import {WorkerKind} from "./workers/types";

window.addEventListener("load", async () => {

	const comments = document.getElementById("bookedit_comments");

	if (comments) {
		const button = document.createElement("button");
		button.innerHTML = "Find PDF";
		button.addEventListener("click", async (event: MouseEvent) => {
			event.preventDefault();
			const test = await invokeWorker(WorkerKind.Finder, {author: "author", title: "title"});
			console.log(test);
		});
		comments.appendChild(button);
	}

});
