import Author from "../../adapters/author";
import {appendUI, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";

const onEdit = async () => {
	viewTagEditor();
};

const onSave = async () => {
	viewExistingTags();
};

const getUUID = () => {
	const [, , uuid] = window.location.pathname.split("/");
	return uuid;
};

const getTags = async () => {
	const author = await Author.getAuthor(getUUID());
	author && insertTags(author.tags);
};

window.addEventListener("load", async () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector<HTMLTableCellElement>("table.authorContentTable td.middle");
		if (container) {
			appendUI(container, onEdit, onSave);
			await getTags();
		}
	}
});

// https://www.librarything.com/author/highwaytomson
// https://www.librarything.com/author/kincaidjamaica
