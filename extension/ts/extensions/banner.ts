import Cookies from "../objects/cookies";

const LOGGED_IN_SATURATION = 1.5;
const LOGGED_OUT_SATURATION = 0;
const LOGGED_IN_ID = "VanBlackLibrary";
const LOGGED_IN_COOKIE_KEY = "cookie_userid";

const getElement = (document: Document, id: string): HTMLElement =>
	document.getElementById(id) ??
	(Array.from(document.getElementsByTagName("frame")) as HTMLIFrameElement[])
		.map((frame) => getElement(frame.contentWindow.document, id))
		.find((masthead) => !!masthead);

const editElement = <E extends HTMLElement>(id: string, callback: (element: E) => void) => {
	// warning: THIS IS NOT TYPE SAFE. it's LAZY
	const element = getElement(document, id) as E;
	element && callback(element);
};

const setLogo = (id: string) =>
	editElement(id, (logo: HTMLImageElement) => (logo.src = chrome.runtime.getURL("img/icon128.png")));

const setCSS = (id: string, css: Partial<CSSStyleDeclaration>) =>
	editElement(id, (element) => Object.entries(css).forEach(([key, value]) => (element.style[key] = value)));

const setFavicon = () =>
	Array.from(document.getElementsByTagName("link"))
		.filter((element) => element.rel === "icon")
		.map((element) => {
			element.href = chrome.runtime.getURL("img/favicon.ico");
			element.type = "image/x-icon";
		});

const selectFilter = (): string => `saturate(${loggedIn() ? LOGGED_IN_SATURATION : LOGGED_OUT_SATURATION})`;

const loggedIn = (): boolean => Cookies.get(LOGGED_IN_COOKIE_KEY) === LOGGED_IN_ID;

window.addEventListener("load", () => {
	setCSS("masthead", {transition: "500ms", filter: selectFilter()});

	const background = `url(${chrome.runtime.getURL("img/icon128.png")}) no-repeat 16px 0`;
	setCSS("masthead_logo_wordmark", {background});
	setLogo("masthead_lt_logo");
	setFavicon();
});
