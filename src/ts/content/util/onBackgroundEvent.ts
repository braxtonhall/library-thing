import {Message} from "../../common/types";
import {BackgroundEvent, BackgroundEventMessage} from "../../common/backgroundEvent";
import * as browser from "webextension-polyfill";

type Listener = () => void;

const isBackgroundEventMessage = (message: Message): message is BackgroundEventMessage =>
	message.message === "background-event";

const onBackgroundEvent = (kind: BackgroundEvent, callback: Listener): void => void listeners.get(kind).add(callback);
const offBackgroundEvent = (kind: BackgroundEvent, callback: Listener): void =>
	void listeners.get(kind).delete(callback);
const onceBackgroundEvent = (kind: BackgroundEvent, callback: Listener): void => {
	const realListener: Listener = () => {
		callback();
		offBackgroundEvent(kind, realListener);
	};
	return onBackgroundEvent(kind, realListener);
};

const listeners = new Map<BackgroundEvent, Set<Listener>>(
	Object.values(BackgroundEvent).map((kind) => [kind, new Set<Listener>()])
);

browser.runtime.onMessage.addListener((message: Message) => {
	if (isBackgroundEventMessage(message)) {
		const {kind} = message;
		listeners.get(kind).forEach((listener) => listener());
	}
});

export {onBackgroundEvent, offBackgroundEvent, onceBackgroundEvent};
