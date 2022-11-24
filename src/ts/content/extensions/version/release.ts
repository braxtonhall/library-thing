import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerKind} from "../../../common/workers/types";
import {toVersion, Version} from "./version";

const RELEASES_URL = "https://api.github.com/repos/braxtonhall/library-thing/releases/latest";
const DEFAULT_VERSION = "0.0.0";

interface GitHubRelease {
	tag_name?: string;
	assets?: {browser_download_url: string}[];
	body?: string;
	html_url?: string;
}

interface Release {
	version: Version;
	download: string;
	details: string;
	html: string;
}

const getLatestGitHubRelease = async (): Promise<GitHubRelease> => {
	try {
		return JSON.parse(await invokeWorker(WorkerKind.Get, RELEASES_URL));
	} catch (error) {
		console.error(error);
		return {};
	}
};

const getLatestRelease = async (): Promise<Release> => {
	const latest = await getLatestGitHubRelease();
	const tag = latest?.tag_name ?? DEFAULT_VERSION;
	const [asset] = latest?.assets ?? [];
	const download = asset?.browser_download_url ?? "";
	const details = latest?.body ?? "";
	const html = latest?.html_url ?? "";
	return {version: toVersion(tag), download, details, html};
};

export {getLatestRelease};
