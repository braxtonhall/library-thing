import "../../sass/options.sass";
import {invokeWorker} from "../common/workers/invoker";
import {WorkerKind} from "../common/workers/types";
import {loaderOverlaid} from "../common/ui/loadingIndicator";
import config, {ConfigKey} from "../common/entities/config";
import {isValidSheetLink} from "../common/entities/spreadsheet";

const getAuthorization = (interactive: boolean) => invokeWorker(WorkerKind.Authorize, interactive).catch(() => "");
const removeAuthorization = () => invokeWorker(WorkerKind.DeAuthorize, null).catch(() => undefined);

const isAuthorized = async (interactive: boolean) => !!(await getAuthorization(interactive));

const getElement =
	<T extends HTMLElement>(id: string) =>
	() =>
		document.getElementById(id) as T;

const logInButton = getElement<HTMLButtonElement>("log-in-button");
const logOutButton = getElement<HTMLButtonElement>("log-out-button");
const saveButton = getElement<HTMLButtonElement>("save-tag-index");
const tagIndexInput = getElement<HTMLInputElement>("tag-index");
const moreInfo = getElement<HTMLDivElement>("more-info");

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

const setTagIndex = async () => (tagIndexInput().value = (await config.get(ConfigKey.SpreadsheetLink)) ?? "");

const onValidValue = (valid: (value: string) => void, invalid?: () => void) => async () => {
	const {value} = tagIndexInput();
	if (await isValidSheetLink(value)) {
		return valid(value);
	} else {
		return invalid?.();
	}
};

const getTagIndex = onValidValue(async (value) => {
	await config.set(ConfigKey.SpreadsheetLink, value);
	moreInfo().innerText = "SAVED";
	saveButton().disabled = true;
});

const validateTagIndex = onValidValue(
	() => {
		moreInfo().innerText = "UNSAVED";
		saveButton().disabled = false;
	},
	() => {
		moreInfo().innerText = "INVALID";
		saveButton().disabled = true;
	}
);

window.addEventListener("pageshow", async () => {
	logInButton().addEventListener("click", () => authorize(true));
	logOutButton().addEventListener("click", logOut);
	saveButton().addEventListener("click", getTagIndex);
	tagIndexInput().addEventListener("input", validateTagIndex);
	return Promise.all([authorize(false), setTagIndex()]);
});
