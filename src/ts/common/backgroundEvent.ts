import {Message} from "./types";

enum BackgroundEvent {
	CompletedAuth = "authed",
	RemovedAuth = "de-authed",
	AddedSheetLink = "sheet-link",
	EditEnforcement = "edit-enforcement",
}

interface BackgroundEventMessage extends Message {
	message: "background-event";
	kind: BackgroundEvent;
}

export {BackgroundEvent, BackgroundEventMessage};
