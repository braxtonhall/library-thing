import "../../../sass/banner.sass";

import * as browser from "webextension-polyfill";

import Cookies from "../adapters/cookies";
import {onLogged} from "./util/onLogged";

const AUTHED_CLASS = "authed";
const DEAUTHED_CLASS = "de-authed";
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

const setSrc = (id: string, src: string) =>
	editElement(id, (logo: HTMLImageElement) => {
		logo.src = src;
		logo.srcset = src;
	});

const setCSS = (id: string, css: Partial<CSSStyleDeclaration>) =>
	editElement(id, (element) => Object.entries(css).forEach(([key, value]) => (element.style[key] = value)));

const setFavicon = () =>
	Array.from(document.getElementsByTagName("link"))
		.filter((element) => element.rel === "icon")
		.map((element) => {
			element.href = browser.runtime.getURL("img/favicon.ico");
			element.type = "image/x-icon";
		});

const loggedIn = (): boolean => Cookies.get(LOGGED_IN_COOKIE_KEY) === LOGGED_IN_ID;

const setMasthead = (authorized: boolean) =>
	editElement("masthead", (masthead: HTMLElement) => {
		if (authorized && loggedIn()) {
			masthead.classList.add(AUTHED_CLASS);
			masthead.classList.remove(DEAUTHED_CLASS);
		} else {
			masthead.classList.add(DEAUTHED_CLASS);
			masthead.classList.remove(AUTHED_CLASS);
		}
	});

window.addEventListener("pageshow", () => {
	const vblLogo = browser.runtime.getURL("img/icon128.png");
	const logoCss = `url(${vblLogo}) no-repeat 16px 0`;
	setCSS("masthead_logo_wordmark", {background: logoCss});
	setSrc("masthead_logo_wordmark2", vblLogo);
	setSrc("masthead_lt_logo", vblLogo);
	setSrc("masthead_lt_logo2", vblLogo);
	setFavicon();
	return onLogged({
		onLogOut: () => setMasthead(false),
		onLogIn: () => setMasthead(true),
	});
});
