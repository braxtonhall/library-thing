import Author from "../../../adapters/author";
import {appendUI, getInput, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";
import {loaderOverlaid} from "../../../ui/loadingIndicator";
import Book from "../../../adapters/book";
import {createPushBookTags, createSyncBookTags} from "../util";
import {getAuthorInfo, getTags} from "./util";
import {onEditAllBooks} from "./editAllBooks";

const onEdit = () => {
	viewTagEditor();
};

const onSave = () => {
	const tags = getInput().split(",");
	return loaderOverlaid(async () => {
		const author = await Author.writeAuthor({...getAuthorInfo(), tags});
		author && insertTags(author.tags);
		viewExistingTags();
	});
};

const onPush = onEditAllBooks({
	onSuccess: (name) => `Pushed tags for ${name}`,
	onWarning: () => "Failed to push tags for some books",
	updateBook: createPushBookTags(Author.getAuthor, Book.saveBook),
	onError: (name) => `Failed to push tags for ${name}`,
});

const onSync = onEditAllBooks({
	onSuccess: (name) => `Synced tags for ${name}`,
	onWarning: () => "Failed to sync tags for some books",
	updateBook: createSyncBookTags(Author.getAuthor, Book.saveBook),
	onError: (name) => `Failed to sync tags for ${name}`,
});

window.addEventListener("load", async () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector<HTMLTableCellElement>("table.authorContentTable td.middle");
		if (container) {
			appendUI(container, {onSync, onEdit, onSave, onPush});
			await getTags();
		}
	}
});
