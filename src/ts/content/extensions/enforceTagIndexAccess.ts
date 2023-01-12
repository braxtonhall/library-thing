import config, {ConfigKey} from "../../common/entities/config";
import {createModal, dismissModals} from "../../common/ui/modal";
import {UIColour} from "../../common/ui/colour";
import {onLogged} from "./util/onLogged";
import {invokeWorker} from "../../common/workers/invoker";
import {WorkerKind} from "../../common/workers/types";
import {onBackgroundEvent} from "../util/onBackgroundEvent";
import {BackgroundEvent} from "../../common/backgroundEvent";

let canAccessTagIndex = true; // default to true to reduce likelihood of pop in (very unlikely)

const enforceTagIndexAccess = async () => {
	dismissModals();
	if (await config.get(ConfigKey.EnforceTagIndexAccess)) {
		const createWarningModal = async () => {
			canAccessTagIndex === false &&
				createModal({
					text: "Hey there!",
					subText: [
						"It looks like you might not be logged in or do not have a tag index set",
						"Please login and/or set a Tag Index link under the extension options",
					],
					elements: [
						{
							kind: "button",
							text: "Open Options",
							colour: UIColour.PURPLE,
							onClick: async () => {
								void invokeWorker(WorkerKind.OpenOptions, null);
								return createWarningModal();
							},
						},
					],
					colour: UIColour.PURPLE,
					onCancel: createWarningModal,
				});
		};
		return createWarningModal();
	}
};

onBackgroundEvent(BackgroundEvent.EditEnforcement, enforceTagIndexAccess);
window.addEventListener("pageshow", async () => {
	await onLogged({
		onLogIn: () => {
			canAccessTagIndex = true;
			return enforceTagIndexAccess();
		},
		onLogOut: () => {
			canAccessTagIndex = false;
			return enforceTagIndexAccess();
		},
	});
});
