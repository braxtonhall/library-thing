import {onFormRender} from "../entities/bookForm";

const view = (display: "none" | "") => (element: HTMLElement) => (element.style.display = display);
const hide = view("none");
const show = view("");

const createSortIndicatorContainer = () => {
	const div = document.createElement("div");
	div.className = "book_itemBottomControl";
	div.style.width = "95%";
	div.style.paddingLeft = "5px";
	return div;
};

const createSortIndicator = () => {
	const span = document.createElement("span");
	span.className = "bookEditHint";
	hide(span);
	return span;
};

const onSortingChange = (indicator: HTMLSpanElement, textArea: HTMLTextAreaElement, sort: HTMLSelectElement) => () => {
	// the "default" behaviour is two options in LibraryThing. 999 and 1.
	const sortFrom = sort.value === "999" ? 1 : Number(sort.value);
	const title = textArea.value;
	const sortedTitle = title.slice(sortFrom - 1);
	indicator.innerText = `sorted as: "${sortedTitle}"`;
	if (title !== sortedTitle) {
		show(indicator);
	} else {
		hide(indicator);
	}
};

onFormRender(() => {
	const bookEditContainer = document.getElementById("bookedit_title") as HTMLDivElement;
	const sortSelector = document.getElementById("sortcharselector") as HTMLSelectElement;
	const title = document.getElementById("form_title") as HTMLTextAreaElement;
	if (bookEditContainer) {
		const sortIndicatorContainer = createSortIndicatorContainer();
		const sortIndicator = createSortIndicator();
		bookEditContainer.append(sortIndicatorContainer);
		sortIndicatorContainer.append(sortIndicator);
		const onChange = onSortingChange(sortIndicator, title, sortSelector);
		title.addEventListener("input", onChange);
		title.addEventListener("change", onChange);
		sortSelector.addEventListener("change", onChange);
		onChange();
	}
});
