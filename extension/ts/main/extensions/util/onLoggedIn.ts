import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerError, WorkerErrorKind, WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../ui/button";
import {isAuthorized} from "../author/util/isAuthorized";
import {showToast, ToastType} from "../../ui/toast";

const BAD_BROWSER_INFO_URL =
	"https://github.com/braxtonhall/library-thing/blob/main/docs/librarian/authors.md#prerequisites";

const authorize = (interactive: boolean) => invokeWorker(WorkerKind.Authorize, interactive).catch(handleAuthFailure);

const handleAuthFailure = (error: WorkerError) => {
	if (error.kind === WorkerErrorKind.UnsupportedBrowser) {
		showToast(
			"This browser is not yet supported. Click here to see which browsers are compatible with this feature.",
			ToastType.ERROR,
			() => window.open(BAD_BROWSER_INFO_URL)
		);
	}
	throw error;
};

const injectButton = (button: HTMLTableCellElement, container: HTMLElement) => {
	container.append(button);
};

const removeInjectedButton = (button: HTMLTableCellElement) => {
	button.remove();
};

const onLoggedIn = async (callback: () => void, container: HTMLElement) => {
	if (!(await isAuthorized())) {
		const onClick = async () => {
			authorize(true)
				.then(() => {
					removeInjectedButton(button);
					callback();
				})
				.catch((err) => {
					console.error(err);
				});
		};
		const button = createIconButton("Login", "img/login.png", onClick);
		injectButton(button, container);
	} else {
		callback();
	}
};

export {onLoggedIn};
