import {ConfigKey} from "../../common/entities/config";
import config from "../../common/entities/config";
import {createModal} from "../../common/ui/modal";
import {UIColour} from "../../common/ui/colour";
import {onLogged} from "./util/onLogged";
import {isOverlayRendered, removeOverlay} from "../../common/ui/overlay";
import {invokeWorker} from "../../common/workers/invoker";
import {WorkerKind} from "../../common/workers/types";

window.addEventListener("pageshow", async () => {
	if (await config.get(ConfigKey.EnforceTagIndexAccess)) {
		const createWarningModal = () =>
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
							invokeWorker(WorkerKind.OpenOptions, null);
							createWarningModal();
						},
					},
				],
				colour: UIColour.PURPLE,
				exitable: false,
			});

		onLogged({
			onLogIn: () => {
				removeOverlay();
			},
			onLogOut: async () => {
				if (!isOverlayRendered()) {
					createWarningModal();
				}
			},
		});
	}
});
