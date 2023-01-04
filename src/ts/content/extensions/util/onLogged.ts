import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerError, WorkerErrorKind, WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../../common/ui/button";
import {showToast, ToastType} from "../../../common/ui/toast";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {BackgroundEvent} from "../../../common/backgroundEvent";
import {onBackgroundEvent} from "../../util/onBackgroundEvent";
import {isAuthorized} from "../author/util/isAuthorized";
import {isSheetSet} from "../../../common/entities/spreadsheet";

const BAD_BROWSER_INFO_URL =
	"https://github.com/braxtonhall/library-thing/blob/main/docs/librarian/authors.md#prerequisites";

interface OnLogOptions {
	onLogIn?: OnLoggedCallback;
	onLogOut?: OnLoggedCallback;
	container?: HTMLElement;
	description?: string;
}

type OnLoggedCallback = () => void;
const loginCallbacks: OnLoggedCallback[] = [];
const logoutCallbacks: OnLoggedCallback[] = [];

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

const handleStatusChange = (text: string, toastType: ToastType) => async () => {
	showToast(text, toastType);
	const status = await getLogStatus();
	if (status.ready) {
		loginCallbacks.forEach((callback) => callback());
	} else {
		logoutCallbacks.forEach((callback) => callback());
	}
};

const onLoginClick = () => loaderOverlaid(() => authorize(true).catch(console.error));

const compose =
	(...listeners: OnLoggedCallback[]): OnLoggedCallback =>
	() =>
		listeners.forEach((listener) => listener?.());

const saveCallback = (callback: OnLoggedCallback, callbacks: OnLoggedCallback[], applyNow: boolean): void => {
	callbacks.push(callback);
	applyNow && callback();
};

const getLogStatus = async () => {
	const futureAuth = isAuthorized();
	const futureSheetSet = isSheetSet();
	const [authed, sheetSet] = await Promise.all([futureAuth, futureSheetSet]);
	return {authed, sheetSet, ready: authed && sheetSet};
};

const onLogged = async ({onLogIn, onLogOut, container, description}: OnLogOptions) => {
	if (container) {
		const loginButton = createIconButton("Login", "img/login.png", onLoginClick, description);
		const sheetLinkButton = createIconButton("Add Tag Index", "img/login.png", onLoginClick);
		onLogIn = compose(
			() => removeInjectedButton(loginButton),
			() => removeInjectedButton(sheetLinkButton),
			onLogIn
		);
		onLogOut = compose(
			() =>
				getLogStatus().then(({authed, sheetSet}) => {
					authed || injectButton(loginButton, container);
					sheetSet || injectButton(sheetLinkButton, container);
				}),
			onLogOut
		);
	}
	const status = await getLogStatus();
	saveCallback(onLogIn, loginCallbacks, status.ready === true);
	saveCallback(onLogOut, logoutCallbacks, status.ready === false);
};

window.addEventListener("pageshow", () => {
	onBackgroundEvent(BackgroundEvent.CompletedAuth, handleStatusChange("Logged in!", ToastType.SUCCESS));
	onBackgroundEvent(BackgroundEvent.RemovedAuth, handleStatusChange("Logged out!", ToastType.INFO));
	onBackgroundEvent(BackgroundEvent.AddedSheetLink, handleStatusChange("Tag Index set!", ToastType.SUCCESS));
});

export {onLogged};
