import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerError, WorkerErrorKind, WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../ui/button";
import {isAuthorized} from "../author/util/isAuthorized";
import {showToast, ToastType} from "../../ui/toast";
import {loaderOverlaid} from "../../ui/loadingIndicator";
import {BackgroundEvent, onBackgroundEvent} from "../../../common/backgroundEvent";

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

const handleLog = (text: string, toastType: ToastType, callbacks: OnLoggedCallback[]) => () => {
	showToast(text, toastType);
	callbacks.map((callback) => callback());
};

const handleLogin = handleLog("Logged in!", ToastType.SUCCESS, loginCallbacks);
const handleLogout = handleLog("Logged out!", ToastType.INFO, logoutCallbacks);

const onClick = () => loaderOverlaid(() => authorize(true).catch(console.error));

const compose =
	(...listeners: OnLoggedCallback[]): OnLoggedCallback =>
	() =>
		listeners.forEach((listener) => listener?.());

const saveCallback = (callback: OnLoggedCallback, callbacks: OnLoggedCallback[], applyNow: boolean): void => {
	callbacks.push(callback);
	applyNow && callback();
};

const onLogged = async ({onLogIn, onLogOut, container, description}: OnLogOptions) => {
	const authed = await isAuthorized();
	if (container) {
		const button = createIconButton("Login", "img/login.png", onClick, description);
		onLogIn = compose(() => removeInjectedButton(button), onLogIn);
		onLogOut = compose(() => injectButton(button, container), onLogOut);
	}
	saveCallback(onLogIn, loginCallbacks, authed === true);
	saveCallback(onLogOut, logoutCallbacks, authed === false);
};

window.addEventListener("load", () => {
	onBackgroundEvent(BackgroundEvent.CompletedAuth, handleLogin);
	onBackgroundEvent(BackgroundEvent.RemovedAuth, handleLogout);
});

export {onLogged};
