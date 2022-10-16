import Author from "../../adapters/author";
import {appendUI, getInput, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";
import {createLoader, removeLoader} from "../../ui/loadingIndicator";

const onEdit = () => {
	viewTagEditor();
};

const onSave = async () => {
	const tags = getInput().split(",");
	const loader = createLoader();
	const author = await Author.writeAuthor({...getAuthorInfo(), tags});
	author && insertTags(author.tags);
	viewExistingTags();
	removeLoader(loader);
};

const onSync = async () => {
	// TODO this is the big one lol
};

const getAuthorInfo = () => {
	const [, , uuid] = window.location.pathname.split("/");
	const name = document.querySelector("div.authorIdentification > h1").textContent;
	return {name, uuid};
};

const getTags = async () => {
	const author = await Author.getAuthor(getAuthorInfo().uuid);
	author && insertTags(author.tags);
};

window.addEventListener("load", async () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector<HTMLTableCellElement>("table.authorContentTable td.middle");
		if (container) {
			appendUI(container, onSync, onEdit, onSave);
			await getTags();
		}
	}
});
