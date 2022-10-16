import Author from "../../adapters/author";
import {appendUI, getInput, insertTags, viewExistingTags, viewTagEditor} from "./authorUI";
import {createLoader, removeLoader} from "../../ui/loadingIndicator";
import {getBooks} from "../../adapters/book";
import {showToast, ToastType} from "../../ui/toast";

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
	const identity = (success) => success;
	const loader = createLoader();
	const {uuid, name} = getAuthorInfo();
	let allFailed, allPassed;
	try {
		const [author, books] = await Promise.all([Author.getAuthor(uuid), getBooks({author: uuid})]);
		const tags = author?.tags ?? [];
		const futureUpdates = books.map(updateBook(uuid, tags));
		const updates = await Promise.all(futureUpdates);
		allFailed = !updates.some(identity);
		allPassed = updates.every(identity);
	} catch (error) {
		console.error(error);
		allFailed = true;
		allPassed = false;
	}
	removeLoader(loader);

	if (allFailed) {
		showToast(`Failed to sync tags for ${name}`, ToastType.ERROR);
	} else if (allPassed) {
		showToast(`Synced tags for ${name}`, ToastType.SUCCESS);
	} else {
		showToast(`Failed to sync tags for some books`, ToastType.WARNING);
	}
};

const updateBook =
	(uuid: string, tags: string[]) =>
	(book: string): Promise<boolean> => {
		// book_tags = book.author_tags
		// maybe_delete_tags = book_tags - author_tags
		// other_author_tags = book.authors.filter(_ not equals author_id).flat(google_doc.get_tags)
		// delete_tags = maybe_delete_tags.filter(_ not in other_author_tags)
		// book.author_tags = (book_tags + author_tags) - delete_tags
		return Promise.resolve(true);
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
