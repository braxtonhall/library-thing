import {showToast, ToastType} from "../../common/ui/toast";
import {invokeWorker} from "../../common/workers/invoker";
import {WorkerKind} from "../../common/workers/types";
import config, {ConfigKey} from "../../common/entities/config";
import storage from "../../common/adapters/storage";

const RELEASES_URL = "https://api.github.com/repos/braxtonhall/library-thing/releases/latest";
const DEFAULT_VERSION = "0.0.0";
const LAST_CHECKED_KEY = "last-checked-version";

interface Releases {
	tag_name?: string;
	assets?: {browser_download_url: string}[];
}

interface Version {
	major: number;
	minor: number;
	revision: number;
}

const toVersion = (tag: string): Version => {
	const [major, minor, revision] = tag.split(".").map(Number);
	return {major, minor, revision};
};

const getCurrentVersion = () => toVersion(chrome.runtime.getManifest().version);

const getReleases = async (): Promise<Releases> => {
	try {
		return JSON.parse(await invokeWorker(WorkerKind.Get, RELEASES_URL));
	} catch (error) {
		console.error(error);
		return {};
	}
};

const getRemoteDetails = async (): Promise<{version: Version; download: string}> => {
	const releases = await getReleases();
	const tag = releases?.tag_name ?? DEFAULT_VERSION;
	const [asset] = releases?.assets ?? [];
	const download = asset?.browser_download_url ?? "";
	return {version: toVersion(tag), download};
};

const lessThan = (versionA: Version, versionB: Version, keys: (keyof Version)[]): boolean => {
	const [key, ...rest] = keys;
	if (key) {
		if (versionA[key] < versionB[key]) {
			return true;
		} else if (versionA[key] > versionB[key]) {
			return false;
		} else {
			return lessThan(versionA, versionB, rest);
		}
	} else {
		return false;
	}
};

const versionLessThan = (versionA: Version, versionB: Version): boolean =>
	lessThan(versionA, versionB, ["major", "minor", "revision"]);

const getCheckInterval = (): Promise<number> => config.get(ConfigKey.CheckVersionInterval);
const shouldCheckVersion = async (): Promise<boolean> =>
	Date.now() > (await getLastChecked()) + (await getCheckInterval());
const getLastChecked = async (): Promise<number> => storage.get(LAST_CHECKED_KEY, 0);
const saveLastChecked = async (): Promise<number> => storage.set(LAST_CHECKED_KEY, Date.now());

window.addEventListener("load", async () => {
	if (await shouldCheckVersion()) {
		const {version, download} = await getRemoteDetails();
		if (versionLessThan(getCurrentVersion(), version) && download) {
			showToast("New version available!\n\nClick here to download it.", ToastType.INFO, () =>
				window.open(download)
			);
		}
		return saveLastChecked();
	}
});
