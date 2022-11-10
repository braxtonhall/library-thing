import "../../sass/options.sass";
import {invokeWorker} from "../common/workers/invoker";
import {WorkerKind} from "../common/workers/types";
import {loaderOverlaid} from "../common/ui/loadingIndicator";

const getAuthorization = (interactive: boolean) => invokeWorker(WorkerKind.Authorize, interactive).catch(() => "");
const removeAuthorization = () => invokeWorker(WorkerKind.DeAuthorize, null).catch(() => undefined);

const isAuthorized = async (interactive: boolean) => !!(await getAuthorization(interactive));

const getButton = (id: string) => () => document.getElementById(id) as HTMLButtonElement;

const logInButton = getButton("log-in-button");
const logOutButton = getButton("log-out-button");

const setClass = (canLogIn: boolean, canLogOut: boolean) => {
	logInButton().disabled = !canLogIn;
	logOutButton().disabled = !canLogOut;
};

const authorize = (interactive: boolean) =>
	loaderOverlaid(async () => {
		const authorized = await isAuthorized(interactive);
		const [canLogIn, canLogOut] = authorized ? [false, true] : [true, false];
		setClass(canLogIn, canLogOut);
	});

const logOut = async () => {
	await removeAuthorization();
	setClass(true, false);
};

window.addEventListener("load", async () => {
	logInButton().addEventListener("click", () => authorize(true));
	logOutButton().addEventListener("click", logOut);
	return authorize(false);
});
