import {Message} from "./types";

enum BackgroundEvent {
	CompletedAuth = "authed",
	RemovedAuth = "de-authed",
}

interface BackgroundEventMessage extends Message {
	message: "background-event";
	kind: BackgroundEvent;
}

export {BackgroundEvent, BackgroundEventMessage};
