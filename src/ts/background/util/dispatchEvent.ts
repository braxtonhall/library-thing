import {BackgroundEvent, BackgroundEventMessage} from "../../common/backgroundEvent";
import * as browser from "webextension-polyfill";
import Tab = browser.Tabs.Tab;

const sendToTab = (event: BackgroundEventMessage) => (tab: Tab) => browser.tabs.sendMessage(tab.id, event);

const sendToTabs = (event: BackgroundEventMessage) => (tabs: Tab[]) => tabs.forEach(sendToTab(event));

const dispatchEvent = (event: BackgroundEvent) => {
	const matches = browser.runtime.getManifest().content_scripts.flatMap((contentScript) => contentScript.matches);
	const message: BackgroundEventMessage = {kind: event, message: "background-event"};
	return browser.tabs.query({url: matches}).then(sendToTabs(message));
};

export {dispatchEvent};
