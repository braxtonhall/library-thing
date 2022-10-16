import {createButton} from "../ui/button";
import {getBooks} from "../adapters/book";

const getUUID = () => {
	const [, , uuid] = window.location.pathname.split("/");
	return uuid;
};

window.addEventListener("load", () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector("table.authorContentTable td.middle");
		const button = createButton("CLICK", "img/search.png", async () => {
			console.log(await getBooks({author: getUUID()}));
		});
		container.insertBefore(button, container.children[2]);
		console.log(container);
	}
});
