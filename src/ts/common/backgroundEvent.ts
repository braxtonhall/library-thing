import {Message} from "./types";

enum BackgroundEvent {
	CompletedAuth = "authed",
	RemovedAuth = "de-authed",
	BookCopied = "book-copied",
}

interface BackgroundEventMessage extends Message {
	message: "background-event";
	kind: BackgroundEvent;
}

export {BackgroundEvent, BackgroundEventMessage};
