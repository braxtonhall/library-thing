import Author, {AuthorRecord} from "../../../adapters/author";
import {appendUI, getInput, insertTags, AUTHOR_TAG_INPUT_ID, viewExistingTags, viewTagEditor} from "./authorUI";
import {loaderOverlaid} from "../../../../common/ui/loadingIndicator";
import Book from "../../../adapters/book";
import {createPushBookTags, createSyncBookTags} from "../util/bookEditor";
import {getAuthorInfo, getTags} from "./util";
import {onEditAllBooks} from "./editAllBooks";
import {createModal} from "../../../../common/ui/modal";
import {showToast, ToastType} from "../../../../common/ui/toast";
import {onPull} from "./pull";
import {UIColour} from "../../../../common/ui/colour";
import {appendTagValidator} from "../../util/tagValidation";

const onEdit = () => {
	viewTagEditor();
};

const onBackToExistingTags = (getAuthor: () => Promise<AuthorRecord>) => () =>
	loaderOverlaid(async () => {
		const author = await getAuthor();
		author && insertTags(author.tags);
		viewExistingTags();
	});

const listeners = new Set<() => Promise<boolean>>();

const onSave = async () => {
	const futureApprovals = [...listeners].map((listener) => listener());
	const approvals = await Promise.all(futureApprovals);
	if (approvals.every((approval) => approval === true)) {
		return onBackToExistingTags(() => Author.writeAuthor({...getAuthorInfo(), tags: getInput()}))();
	}
};

const onCancel = onBackToExistingTags(() => Author.getAuthor(getAuthorInfo().uuid));

const onPush = onEditAllBooks({
	onSuccess: (name) => `Pushed tags for ${name}`,
	onWarning: () => "Failed to push tags for some books",
	updateBook: createPushBookTags(Author.getAuthor, Book.saveBook),
	onError: (name) => `Failed to push tags for ${name}`,
});

const onSyncImplementation = onEditAllBooks({
	onSuccess: (name) => `Synced tags for ${name}`,
	onWarning: () => "Failed to sync tags for some books",
	updateBook: createSyncBookTags(Author.getAuthor, Book.saveBook),
	onError: (name) => `Failed to sync tags for ${name}`,
});

const userIsSure = (): Promise<boolean> =>
	new Promise<boolean>((resolve) => {
		createModal({
			text: "Are you sure you want to Sync?",
			subText: [
				"Syncing will remove all author tags not associated with any author of a book. Ensure that your tags are complete!",
			],
			onCancel: async () => resolve(false),
			colour: UIColour.PURPLE,
			elements: [
				{kind: "button", text: "Sync", colour: UIColour.GREY, onClick: async () => resolve(true)},
				{kind: "button", text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
			],
		});
	});

const onSync = async () => {
	if (await userIsSure()) {
		return onSyncImplementation();
	} else {
		showToast("Sync cancelled", ToastType.INFO);
	}
};

window.addEventListener("pageshow", async () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector<HTMLTableCellElement>("table.authorContentTable td.middle");
		if (container) {
			appendUI(container, {onSync, onEdit, onSave, onPush, onPull, onCancel}, getTags);
			const input = document.getElementById(AUTHOR_TAG_INPUT_ID) as HTMLInputElement;
			const {showTagValidator} = appendTagValidator(
				(listener) => listeners.add(listener),
				(listener) => listeners.delete(listener),
				input
			);
			showTagValidator();
		}
	}
});
