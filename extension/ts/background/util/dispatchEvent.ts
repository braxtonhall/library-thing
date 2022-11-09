import {BackgroundEvent, BackgroundEventMessage} from "../../common/backgroundEvent";
import Tab = chrome.tabs.Tab;

const sendToTab = (event: BackgroundEventMessage) => (tab: Tab) => {
	console.log(tab);
	chrome.tabs.sendMessage(tab.id, event);
};

const sendToTabs = (event: BackgroundEventMessage) => (tabs: Tab[]) => tabs.forEach(sendToTab(event));

const dispatchEvent = (event: BackgroundEvent) => {
	const matches = chrome.runtime.getManifest().content_scripts.flatMap((contentScript) => contentScript.matches);
	const message: BackgroundEventMessage = {kind: event, message: "background-event"};
	chrome.tabs.query({url: matches}, sendToTabs(message));
};

export {dispatchEvent};
