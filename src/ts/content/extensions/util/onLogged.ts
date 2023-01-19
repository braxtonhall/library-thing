import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerError, WorkerErrorKind, WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../../common/ui/button";
import {showToast, ToastType} from "../../../common/ui/toast";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {BackgroundEvent} from "../../../common/backgroundEvent";
import {onBackgroundEvent} from "../../util/onBackgroundEvent";
import {isAuthorized} from "../author/util/isAuthorized";
import {isSheetSet} from "../../../common/entities/spreadsheet";

const BAD_BROWSER_INFO_URL = "https://betterlibrarything.com/";

interface OnLogOptions {
	onLogIn?: OnLoggedCallback;
	onLogOut?: OnLoggedCallback;
	container?: HTMLElement;
	description?: string;
}

type LoggedStatus = {authed: boolean; sheetSet: boolean; ready: boolean};
type OnLoggedCallback = () => void;
type InternalOnLoggedCallback = (status: LoggedStatus) => void;
const loginCallbacks: InternalOnLoggedCallback[] = [];
const logoutCallbacks: InternalOnLoggedCallback[] = [];

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
		loginCallbacks.forEach((callback) => callback(status));
	} else {
		logoutCallbacks.forEach((callback) => callback(status));
	}
};

const onLoginClick = () => loaderOverlaid(() => authorize(true).catch(console.error));
const onAddSheetClick = () => invokeWorker(WorkerKind.OpenOptions, null);

const compose =
	(...listeners: InternalOnLoggedCallback[]): InternalOnLoggedCallback =>
	(status) =>
		listeners.forEach((listener) => listener?.(status));

const saveCallback = (
	callback: InternalOnLoggedCallback,
	callbacks: InternalOnLoggedCallback[],
	status: LoggedStatus,
	applyNow: boolean
): void => {
	callbacks.push(callback);
	applyNow && callback(status);
};

const getLogStatus = async (): Promise<LoggedStatus> => {
	const futureAuth = isAuthorized();
	const futureSheetSet = isSheetSet();
	const [authed, sheetSet] = await Promise.all([futureAuth, futureSheetSet]);
	return {authed, sheetSet, ready: authed && sheetSet};
};

const onLogged = async (options: OnLogOptions) => {
	let onLogIn: InternalOnLoggedCallback = options.onLogIn;
	let onLogOut: InternalOnLoggedCallback = options.onLogOut;
	if (options.container) {
		const loginButton = createIconButton("Login", "img/login.png", onLoginClick, options.description);
		const sheetLinkButton = createIconButton("Add Tag Index", "img/icon16.png", onAddSheetClick);
		const removeButtons = () => {
			removeInjectedButton(loginButton);
			removeInjectedButton(sheetLinkButton);
		};
		onLogIn = compose(removeButtons, onLogIn);
		onLogOut = compose(({authed, sheetSet}) => {
			removeButtons();
			authed || injectButton(loginButton, options.container);
			sheetSet || injectButton(sheetLinkButton, options.container);
		}, onLogOut);
	}
	const status = await getLogStatus();
	saveCallback(onLogIn, loginCallbacks, status, status.ready === true);
	saveCallback(onLogOut, logoutCallbacks, status, status.ready === false);
};

window.addEventListener("pageshow", () => {
	onBackgroundEvent(BackgroundEvent.CompletedAuth, handleStatusChange("Logged in!", ToastType.SUCCESS));
	onBackgroundEvent(BackgroundEvent.RemovedAuth, handleStatusChange("Logged out!", ToastType.INFO));
	onBackgroundEvent(BackgroundEvent.AddedSheetLink, handleStatusChange("Tag Index set!", ToastType.SUCCESS));
});

export {onLogged};
