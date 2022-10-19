import {ForEachFormElement, onFormRender} from "../entities/bookForm";

const RESIZE_EVENT = "resize";
const SIZE_LOCAL_STORAGE_KEY = "_resize-data";

interface SizeRecord extends Size {
	id: string;
}

interface Size {
	width: string;
	height: string;
}

interface SizeData {
	[id: string]: {width: string; height: string};
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
	element.addEventListener("resize", handleResize);
};

const handleResize = (event: Event): void => {
	const element = event.target as HTMLTextAreaElement;
	if (element && element.id && (element.style?.width || element.style?.height)) {
		const width = element.style?.width ?? "";
		const height = element.style?.height ?? "";
		const id = element.id;
		saveSize({id, width, height});
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

onFormRender((form: HTMLElement, forEachElement: ForEachFormElement) =>
	forEachElement(ifTextArea(mutateTextArea(getSizeData())))
);
