import {showToast, ToastType} from "../../ui/toast";
import {loaderOverlaid} from "../../ui/loadingIndicator";
import {onFormRender} from "../../entities/bookForm";
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
	buttonImage?: string;
	isSuccess: (response: T, input: FinderParameters) => boolean;
	onSuccess: (response: T, input: FinderParameters) => string;
	onFail: (response: T, input: FinderParameters) => string;
	transform: (response: T, input: FinderParameters) => string;
	delimiter: string;
}

const createFinderExtension = <T>(options: CreateFinderExtensionOptions<T>) => {
	const onClick = (textArea: HTMLTextAreaElement) => async (event: MouseEvent) => {
		event.preventDefault();
		const input = {author: findAuthor(), title: findTitle(), isbn: findISBN()};

		const response: T = await loaderOverlaid(() => options.finder(input));

		if (options.isSuccess(response, input)) {
			const addition = options.transform(response, input);
			textArea.value += `${textArea.value ? options.delimiter : ""}${addition}`;
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
			textAreaContainer.appendChild(
				createButton(options.buttonName, options.buttonImage ?? "img/search.png", onClick(textArea))
			);
		}
	});
};

export {createFinderExtension};
