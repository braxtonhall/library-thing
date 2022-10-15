import {showToast, ToastType} from "../../ui/toast";
import {createLoader, removeLoader} from "../../ui/loadingIndicator";
import {onFormRender} from "../../objects/bookForm";
import {createButton} from "../../ui/button";
import {Finder, FinderParameters} from "../../services/finder/finder";

const findTextContent = (id: string) => (): string =>
	(document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement)?.value ?? "";

const findTitle = findTextContent("form_title");
const findAuthor = findTextContent("form_authorunflip");
const findISBN = findTextContent("form_ISBN");

interface CreateFinderExtensionOptions<T> {
	finder: Finder<T>;
	textAreaId: string;
	textAreaContainerId: string;
	buttonName: string;
	isSuccess: (response: T, input: FinderParameters) => boolean;
	onSuccess: (response: T, input: FinderParameters) => string;
	onFail: (response: T, input: FinderParameters) => string;
	transform: (response: T, input: FinderParameters) => string;
}

const createFinderExtension = <T>(options: CreateFinderExtensionOptions<T>) => {
	const onClick = (textArea: HTMLTextAreaElement) => async (event: MouseEvent) => {
		event.preventDefault();
		const input = {author: findAuthor(), title: findTitle(), isbn: findISBN()};

		const overlay = createLoader();
		const response: T = await options.finder(input);
		removeLoader(overlay);

		if (options.isSuccess(response, input)) {
			const addition = options.transform(response, input);
			textArea.value += `${textArea.value ? "\n\n" : ""}${addition}`;
			textArea.dispatchEvent(new Event("change"));
			showToast(options.onSuccess(response, input), ToastType.SUCCESS);
		} else {
			showToast(options.onFail(response, input), ToastType.WARNING);
		}
	};

	onFormRender(() => {
		const textAreaContainer = document.getElementById(options.textAreaContainerId);
		const textArea = document.getElementById(options.textAreaId) as HTMLTextAreaElement; // not type safe -- lazy
		if (textAreaContainer && textArea) {
			textAreaContainer.appendChild(createButton(options.buttonName, "img/search.png", onClick(textArea)));
		}
	});
};

export {createFinderExtension};
