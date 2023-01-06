import {Message} from "./types";

enum BackgroundEvent {
	CompletedAuth = "authed",
	RemovedAuth = "de-authed",
	BookCopied = "book-copied",
	AddedSheetLink = "sheet-link",
}

interface BackgroundEventMessage extends Message {
	message: "background-event";
	kind: BackgroundEvent;
}

export {BackgroundEvent, BackgroundEventMessage};
