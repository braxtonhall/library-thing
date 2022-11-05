import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerKind} from "../../../common/workers/types";
import {createIconButton} from "../../ui/button";
import {isAuthorized} from "../author/util/isAuthorized";

const authorize = (interactive: boolean) => invokeWorker(WorkerKind.Authorize, interactive);

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
