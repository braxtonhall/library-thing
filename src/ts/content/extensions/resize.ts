import {ForEachFormElement, onFormRender} from "../entities/bookForm";
import {debounce} from "../../common/util/debounce";
import {getLastFormRender} from "../util/lastFormRender";
import {AUTHOR_TAG_INPUT_ID} from "./author/authorPage/authorUI";

/**
 * This file is dedicated to saving the sizes of the text areas in the book form
 * If you double-click the text area while it is REALLY small, or if you don't
 * use the website for a day, then it will go back to normal
 */

const RESIZE_EVENT = "resize";
const SIZE_LOCAL_STORAGE_KEY = "_resize-data";
const MIN_HEIGHT = 10;
const MIN_WIDTH = 40;
const RESIZE_DEBOUNCE_MS = 10;
const ONE_DAY_MS = 86400000;

interface SizeRecord extends Size {
	id: string;
}

interface Size {
	width: string;
	height: string;
}

interface SizeData {
	[id: string]: Size;
}

const observer = new ResizeObserver((entries) =>
	entries.forEach(({target}) => target.dispatchEvent(new Event(RESIZE_EVENT)))
);

const setElementSize = (element: HTMLTextAreaElement, sizeData: SizeData): void => {
	const {width, height} = sizeData[element.id] ?? {width: "", height: ""};
	if (width || height) {
		element.style.width = width;
		element.style.height = height;
	}
};

const saveSize = ({id, width, height}: SizeRecord): void => saveSizeData({...getSizeData(), [id]: {width, height}});

const getSizeData = (): SizeData => {
	try {
		return JSON.parse(localStorage.getItem(SIZE_LOCAL_STORAGE_KEY));
	} catch (error) {
		console.error(error);
		return {};
	}
};

const saveSizeData = (sizeData: SizeData): void =>
	localStorage.setItem(SIZE_LOCAL_STORAGE_KEY, JSON.stringify(sizeData));

const addListener = (element: HTMLTextAreaElement): void => {
	observer.observe(element);
	element.addEventListener("resize", () => handleResize(element));
	element.addEventListener("dblclick", () => handleUnsetSize(element));
};

const handleResize = debounce((element: HTMLTextAreaElement): void => {
	const width = element.style?.width ?? "";
	const height = element.style?.height ?? "";
	const id = element.id;
	saveSize({id, width, height});
}, RESIZE_DEBOUNCE_MS);

const handleUnsetSize = (element: HTMLTextAreaElement): void => {
	if (element.clientHeight < MIN_HEIGHT || element.clientWidth < MIN_WIDTH) {
		element.style.width = "";
		element.style.height = "";
	}
};

const mutateTextArea =
	(sizeData: SizeData) =>
	(element: HTMLTextAreaElement): void => {
		setElementSize(element, sizeData);
		addListener(element);
	};

const ifTextArea =
	(callback: (element: HTMLTextAreaElement) => void) =>
	(element: Element): void =>
		element.tagName.toUpperCase() === "TEXTAREA" && callback(element as HTMLTextAreaElement);

const beenAWhile = () => getLastFormRender() + ONE_DAY_MS < Date.now();
const clearSizeData = () => localStorage.setItem(SIZE_LOCAL_STORAGE_KEY, "{}");

onFormRender((form: HTMLElement, forEachElement: ForEachFormElement) => {
	beenAWhile() && clearSizeData();
	forEachElement(ifTextArea(mutateTextArea(getSizeData())));
});

window.addEventListener("pageshow", async () => {
	if (document.querySelector("body.authorpage")) {
		const tagTextArea = document.getElementById(AUTHOR_TAG_INPUT_ID) as HTMLTextAreaElement;
		mutateTextArea(getSizeData())(tagTextArea);
	}
});
