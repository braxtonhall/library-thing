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

const onLoggedIn = async ({onLogIn, onLogOut, container, description}: OnLogOptions) => {
	let actualLogIn;
	let actualLogOut;
	if (!container) {
		actualLogIn = onLogIn;
		actualLogOut = onLogOut;
		onLogIn && loginCallbacks.push(onLogIn);
		onLogOut && logoutCallbacks.push(onLogOut);
	} else {
		const button = createIconButton("Login", "img/login.png", onClick, description);

		actualLogIn = () => {
			removeInjectedButton(button);
			onLogIn && onLogIn();
		};
		loginCallbacks.push(actualLogIn);

		actualLogOut = () => {
			injectButton(button, container);
			onLogOut && onLogOut();
		};
		logoutCallbacks.push(actualLogOut);
	}

	if (!(await isAuthorized())) {
		actualLogOut && actualLogOut();
	} else {
		actualLogIn && actualLogIn();
	}
};

window.addEventListener("load", () => {
	onBackgroundEvent(BackgroundEvent.CompletedAuth, handleLogin);
	onBackgroundEvent(BackgroundEvent.RemovedAuth, handleLogout);
});

export {onLoggedIn};
