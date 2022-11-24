import {Message} from "../../common/types";
import {BackgroundEvent, BackgroundEventMessage} from "../../common/backgroundEvent";
import * as browser from "webextension-polyfill";

type Listener = () => void;

const isBackgroundEventMessage = (message: Message): message is BackgroundEventMessage =>
	message.message === "background-event";

const onBackgroundEvent = (kind: BackgroundEvent, callback: Listener): void => {
	listeners.get(kind).push(callback);
};

const listeners = new Map<BackgroundEvent, Listener[]>(Object.values(BackgroundEvent).map((kind) => [kind, []]));

browser.runtime.onMessage.addListener((message: Message) => {
	if (isBackgroundEventMessage(message)) {
		const {kind} = message;
		listeners.get(kind).forEach((listener) => listener());
	}
});

export {onBackgroundEvent};
