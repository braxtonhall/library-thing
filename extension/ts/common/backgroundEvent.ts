import {Message} from "./types";

enum BackgroundEvent {
	CompletedAuth = "authed",
	RemovedAuth = "de-authed",
}

interface BackgroundEventMessage extends Message {
	message: "background-event";
	kind: BackgroundEvent;
}

type Listener = () => void;

const isBackgroundEventMessage = (message: Message): message is BackgroundEventMessage =>
	message.message === "background-event";

const onBackgroundEvent = (kind: BackgroundEvent, callback: Listener): void => {
	listeners.get(kind).push(callback);
};

const listeners = new Map<BackgroundEvent, Listener[]>(Object.values(BackgroundEvent).map((kind) => [kind, []]));

chrome.runtime.onMessage.addListener((message: Message) => {
	if (isBackgroundEventMessage(message)) {
		const {kind} = message;
		listeners.get(kind).forEach((listener) => listener());
	}
});

export {BackgroundEvent, onBackgroundEvent, BackgroundEventMessage};
