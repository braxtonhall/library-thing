import {getDocument} from "../../../util/getDocument";

interface GetLinksEnv {
	baseUrl: string;
	searchUrl: string;
	aSelector: string;
	maxResults: number;
}

const getLinks = async ({searchUrl, aSelector, baseUrl, maxResults}: GetLinksEnv): Promise<string[]> => {
	try {
		const paths: string[] = [];
		(await getDocument(searchUrl))
			.querySelectorAll(aSelector)
			.forEach((element: HTMLLinkElement) => paths.push(element.getAttribute("href")));
		return paths.slice(0, maxResults).map((path) => `${baseUrl}${path}`);
	} catch (error) {
		console.error(error);
		return [];
	}
};

export {getLinks};
