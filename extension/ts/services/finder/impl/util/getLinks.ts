import {invokeWorker} from "../../../../workers/invoker";
import {WorkerKind} from "../../../../workers/types";

interface GetLinksEnv {
	baseUrl: string;
	searchUrl: string;
	aSelector: string;
	maxResults: number;
}

const getLinks = async ({searchUrl, aSelector, baseUrl, maxResults}: GetLinksEnv): Promise<string[]> => {
	const content = await invokeWorker(WorkerKind.Get, searchUrl);
	const foreignDocument = new DOMParser().parseFromString(content, "text/html");
	const paths: string[] = [];
	foreignDocument.querySelectorAll(aSelector).forEach((element: HTMLLinkElement) => paths.push(element.href));
	return paths.slice(0, maxResults).map((path) => `${baseUrl}${path}`);
};

export {getLinks};
