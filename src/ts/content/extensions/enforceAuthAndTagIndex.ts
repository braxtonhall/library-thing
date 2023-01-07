import {ConfigKey} from "../../common/entities/config";
import config from "../../common/entities/config";
import {onBackgroundEvent, onceBackgroundEvent} from "../util/onBackgroundEvent";
import {BackgroundEvent} from "../../common/backgroundEvent";
import {isAuthorized} from "./author/util/isAuthorized";
import {createModal} from "../../common/ui/modal";
import {UIColour} from "../../common/ui/colour";

const isSpreadSheetLinkSet = async () => config.get(ConfigKey.SpreadsheetLink);

window.addEventListener("pageshow", async () => {
	if (await config.get(ConfigKey.EnforceAuthAndTagIndex)) {
		if (!(await isAuthorized()) || !(await isSpreadSheetLinkSet())) {
			const exit = createModal({
				text: "Hey there!",
				subText: [
					"It looks like you might not be logged in or do not have a tag index set",
					"Please login and/or set a tag index link under the extension options",
				],
				colour: UIColour.PURPLE,
				exitable: false,
			});

			onBackgroundEvent(BackgroundEvent.CompletedAuth, async () => {
				if (await isSpreadSheetLinkSet()) {
					exit();
				}
			});

			onceBackgroundEvent(BackgroundEvent.AddedSheetLink, async () => {
				if (await isAuthorized()) {
					exit();
				}
			});
		}
	}
});
