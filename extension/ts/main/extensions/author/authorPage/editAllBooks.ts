import {loaderOverlaid} from "../../../ui/loadingIndicator";
import {showToast, ToastType} from "../../../ui/toast";
import {BookRecord} from "../../../adapters/book";
import {getAuthorInfo} from "./util";
import {getAuthorPageBooks} from "./getAuthorPageBooks";

const isTruthy = (book) => !!book;

interface EditAllBooksParams {
	updateBook: (book: BookRecord) => Promise<BookRecord>;
	onError: (name: string) => string;
	onSuccess: (name: string) => string;
	onWarning: (name: string) => string;
}

const onEditAllBooks =
	({updateBook, onError, onSuccess, onWarning}: EditAllBooksParams) =>
	async () => {
		const {uuid, name} = getAuthorInfo();
		let allFailed, allPassed;

		await loaderOverlaid(async () => {
			try {
				const books = await getAuthorPageBooks(uuid);
				const futureSyncs = books.map(updateBook);
				const syncs = await Promise.all(futureSyncs);
				allFailed = !syncs.some(isTruthy);
				allPassed = syncs.every(isTruthy);
			} catch (error) {
				console.error(error);
				allFailed = true;
				allPassed = false;
			}
		});

		if (allFailed) {
			showToast(onError(name), ToastType.ERROR);
		} else if (allPassed) {
			showToast(onSuccess(name), ToastType.SUCCESS);
		} else {
			showToast(onWarning(name), ToastType.WARNING);
		}
	};

export {onEditAllBooks};
