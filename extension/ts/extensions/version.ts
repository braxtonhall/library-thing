import {showToast, ToastType} from "../ui/toast";
import {invokeWorker} from "../workers/invoker";
import {WorkerKind} from "../workers/types";

const RELEASES_URL = "https://api.github.com/repos/braxtonhall/library-thing/releases/latest";
const DEFAULT_VERSION = "0.0.0";
const ONE_DAY_MS = 86400000;
const LAST_CHECKED_KEY = "__last-checked-version";

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

const getRemoteDetails = async (): Promise<{ version: Version, download: string }> => {
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

const shouldCheckVersion = (): boolean => Date.now() > getLastChecked() + ONE_DAY_MS;
const getLastChecked = (): number => Number(localStorage.getItem(LAST_CHECKED_KEY)) || 0;
const saveLastChecked = (): void => localStorage.setItem(LAST_CHECKED_KEY, String(Date.now()));

window.addEventListener("load", async () => {
	if (shouldCheckVersion()) {
		const {version, download} = await getRemoteDetails();
		if (versionLessThan(getCurrentVersion(), version) && download) {
			showToast(
				"New version available!\n\nClick here to download it.",
				ToastType.INFO,
				() => window.open(download),
			);
		}
		saveLastChecked();
	}
});
