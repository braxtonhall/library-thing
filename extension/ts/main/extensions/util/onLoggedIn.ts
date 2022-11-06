import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerError, WorkerErrorKind, WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../ui/button";
import {isAuthorized} from "../author/util/isAuthorized";
import {showToast, ToastType} from "../../ui/toast";
import {loaderOverlaid} from "../../ui/loadingIndicator";

const BAD_BROWSER_INFO_URL =
	"https://github.com/braxtonhall/library-thing/blob/main/docs/librarian/authors.md#prerequisites";

type OnLoggedInCallback = () => void;
let CALLBACKS: OnLoggedInCallback[] = [];

const authorize = (interactive: boolean) => invokeWorker(WorkerKind.Authorize, interactive).catch(handleAuthFailure);

const handleAuthFailure = (error: WorkerError) => {
	const reason = getReason(error.kind);
	showToast(`${reason} Click here to see which browsers are compatible with this feature.`, ToastType.ERROR, () =>
		window.open(BAD_BROWSER_INFO_URL)
	);
	throw error;
};

const getReason = (kind: WorkerErrorKind) =>
	kind === WorkerErrorKind.UnsupportedBrowser
		? "This browser is not yet supported."
		: "Could not log in. This browser might not yet be supported.";

const injectButton = (button: HTMLTableCellElement, container: HTMLElement) => {
	container.append(button);
};

const removeInjectedButton = (button: HTMLTableCellElement) => {
	button.remove();
};

const resetCallbacks = () => {
	CALLBACKS = [];
};

const onClick = () =>
	loaderOverlaid(() => authorize(true).then(() => showToast("Logged in!", ToastType.SUCCESS)))
		.then(() => CALLBACKS.map((callback) => callback()))
		.then(resetCallbacks)
		.catch(console.error);

const onLoggedIn = async (callback: () => void, container?: HTMLElement, description?: string) => {
	if (!(await isAuthorized())) {
		if (!container) {
			CALLBACKS.push(callback);
		} else {
			const button = createIconButton("Login", "img/login.png", onClick, description);
			injectButton(button, container);

			CALLBACKS.push(() => {
				removeInjectedButton(button);
				callback();
			});
		}
	} else {
		callback();
	}
};

export {onLoggedIn};
