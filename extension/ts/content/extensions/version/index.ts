import {showToast, ToastType} from "../../../common/ui/toast";

import config, {ConfigKey} from "../../../common/entities/config";
import storage from "../../../common/adapters/storage";
import {getLatestRelease} from "./release";
import {toVersion, Version, versionEQ, versionLT} from "./version";

const LAST_CHECKED_KEY = "last-checked-version";
const VERSION_SEEN_KEY = "latest-version-seen";

const getCurrentVersion = () => toVersion(chrome.runtime.getManifest().version);
const getCheckInterval = (): Promise<number> => config.get(ConfigKey.CheckVersionInterval);

const lastSeenVersion = {
	get: (): Promise<Version> => storage.get<Version>(VERSION_SEEN_KEY, {major: 0, minor: 0, revision: 0}),
	set: (): Promise<Version> => storage.set(VERSION_SEEN_KEY, getCurrentVersion()),
};

const checkedTime = {
	get: (): Promise<number> => storage.get(LAST_CHECKED_KEY, 0),
	set: (): Promise<number> => storage.set(LAST_CHECKED_KEY, Date.now()),
};

const beenAWhile = async (): Promise<boolean> => Date.now() > (await checkedTime.get()) + (await getCheckInterval());

const onANewVersion = async (): Promise<boolean> => versionLT(await lastSeenVersion.get(), getCurrentVersion());

false &&
	window.addEventListener("load", async () => {
		if ((await onANewVersion()) || (await beenAWhile())) {
			const {version: remoteVersion, download, html} = await getLatestRelease();
			const currentVersion = getCurrentVersion();
			if (versionLT(currentVersion, remoteVersion)) {
				download &&
					showToast("New version available!\n\nClick here to download it.", ToastType.INFO, () =>
						window.open(download)
					);
			} else if (versionEQ(remoteVersion, currentVersion)) {
				html &&
					showToast(
						"Looks like this is your first time on this version of Better LibraryThing!\n\nClick here to see what's new.",
						ToastType.SUCCESS,
						() => window.open(html)
					);
			}
			await lastSeenVersion.set();
			await checkedTime.set();
		}
	});
