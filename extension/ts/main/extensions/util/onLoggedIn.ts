import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../ui/button";
import {isAuthorized} from "../author/util/isAuthorized";

const LOGIN_BUTTON_ID = "vbl-bll-login";

const authorize = (interactive: boolean) => invokeWorker(WorkerKind.Authorize, interactive).catch(() => "");

function injectButton(onClick: () => void, container: HTMLElement) {
	container.append(createIconButton("Login", "img/login.png", onClick, LOGIN_BUTTON_ID, "Click to log in"));
}

function removeInjectedButton() {
	const loginButton = document.getElementById(LOGIN_BUTTON_ID);
	loginButton?.remove();
}

async function onLoggedIn(callback: () => void, container: HTMLElement) {
	if (!(await isAuthorized())) {
		const onClick = async () => {
			await authorize(true);
			removeInjectedButton();
			callback();
		};
		injectButton(onClick, container);
	} else {
		callback();
	}
}

export {onLoggedIn};
