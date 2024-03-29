import {showToast, ToastType} from "../../../common/ui/toast";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {onFormRender} from "../../entities/bookForm";
import {createIconButton} from "../../../common/ui/button";
import {Finder, FinderParameters} from "../../services/finder/finder";
import {onLogged} from "./onLogged";

const findTextContent = (id: string) => (): string =>
	(document.getElementById(id) as HTMLTextAreaElement | HTMLInputElement)?.value ?? "";

const findTitle = findTextContent("form_title");
const findAuthor = findTextContent("form_authorunflip");
const findISBN = findTextContent("form_ISBN");

interface FinderExtensionOptions<T> {
	finder: Finder<T>;
	textAreaId: string;
	textAreaContainerId: string;
	buttonName: string;
	buttonImage?: string;
	description?: string;
	isSuccess: (response: T, input: FinderParameters) => boolean;
	onSuccess: (response: T, input: FinderParameters) => string;
	onFail: (response: T, input: FinderParameters) => string;
	transform: (response: T, input: FinderParameters) => string;
	delimiter: string;
	requiresLogged?: boolean;
}

const createFinderExtension = <T>(options: FinderExtensionOptions<T>) =>
	onFormRender(() => {
		insertFinder(options);
	});

const insertFinder = <T>(options: FinderExtensionOptions<T>) => {
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

	const textAreaContainer = document.getElementById(options.textAreaContainerId);
	const textArea = document.getElementById(options.textAreaId) as HTMLTextAreaElement; // not type safe -- lazy
	if (textAreaContainer && textArea) {
		const finderButton = createIconButton(
			options.buttonName,
			options.buttonImage ?? "img/search.png",
			onClick(textArea),
			options.description
		);
		textAreaContainer.appendChild(finderButton);

		if (options.requiresLogged) {
			const showFinder = () => (finderButton.style.display = "");
			const hideFinder = () => (finderButton.style.display = "none");
			hideFinder();
			void onLogged({
				onLogIn: showFinder,
				onLogOut: hideFinder,
			});
		}
	} else {
		throw new Error("appendFinder should not have been called on this page");
	}
};

export {createFinderExtension, insertFinder};
