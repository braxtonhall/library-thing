import {invokeWorker} from "../../../../workers/invoker";
import {WorkerKind} from "../../../../workers/types";

interface GetLinksEnv {
	baseUrl: string;
	searchUrl: string;
	aSelector: string;
	maxResults: number;
}

const getLinks = async ({searchUrl, aSelector, baseUrl, maxResults}: GetLinksEnv): Promise<string[]> => {
	try {
		const content = await invokeWorker(WorkerKind.Get, searchUrl);
		const paths: string[] = [];
		new DOMParser()
			.parseFromString(content, "text/html")
			.querySelectorAll(aSelector)
			.forEach((element: HTMLLinkElement) => paths.push(element.getAttribute("href")));
		return paths.slice(0, maxResults).map((path) => `${baseUrl}${path}`);
	} catch (error) {
		return [];
	}
};

export {getLinks};
