const getElement = (document: Document, id: string): HTMLElement =>
	document.getElementById(id) ??
	(Array.from(document.getElementsByTagName("frame")) as HTMLIFrameElement[])
		.map((frame) => getElement(frame.contentWindow.document, id))
		.find((masthead) => !!masthead);

const editElement = <E extends HTMLElement>(id: string, callback: (element: E) => void) => {
	const element = getElement(document, id) as E;
	element && callback(element);
};

const setLogo = (id: string) =>
	editElement(id, (logo: HTMLImageElement) =>
		logo.src = chrome.runtime.getURL("img/icon128.png"));

const setCSS = (id: string, css: Partial<CSSStyleDeclaration>) =>
	editElement(id, (element) =>
		Object.entries(css).forEach(([key, value]) => element.style[key] = value));

window.addEventListener("load", () => {
	setCSS("masthead", {transition: "500ms", filter: "saturate(1.5)"});

	const background = `url(${chrome.runtime.getURL("img/icon128.png")}) no-repeat 16px 0`;
	setCSS("masthead_logo_wordmark", {background});
	setLogo("masthead_lt_logo");
});
