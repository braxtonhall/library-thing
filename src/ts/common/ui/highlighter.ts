import "../../../sass/highlighter.sass";

type Highlightable = HTMLTextAreaElement | HTMLInputElement;
type Highlight = {text: string; highlight: boolean} | string;

const createHighlighterComponents = () => {
	const highlighter = document.createElement("div");
	highlighter.className = "bookEditInput"; // this comes from LibraryThing. Stealing their css
	highlighter.id = "vbl-text-highlighter";

	const backdrop = document.createElement("div");
	backdrop.id = "vbl-text-backdrop";
	backdrop.append(highlighter);

	return {highlighter, backdrop};
};

const toHighlightHTML = (text: string): string => {
	const mark = document.createElement("mark");
	mark.innerText = text;
	return mark.outerHTML;
};

const highlightToText = (highlight: Highlight): string =>
	typeof highlight === "string"
		? highlight
		: highlight.highlight === false
		? highlight.text
		: toHighlightHTML(highlight.text);

const highlightsToText = (highlights: Highlight[]): string => highlights.map(highlightToText).join("") + "\n";

const handleInput = (
	tagInput: Highlightable,
	highlighter: HTMLElement,
	highlight: (value: string) => Promise<Highlight[]>
) => {
	const handler = async () => (highlighter.innerHTML = highlightsToText(await highlight(tagInput.value)));
	tagInput.addEventListener("input", handler);
	tagInput.addEventListener("change", handler);
	onDisplayChange(tagInput, handler);
	handler();
};

const onDisplayChange = (element: HTMLElement, handler: () => void) =>
	new IntersectionObserver((entries) => entries.forEach(handler)).observe(element);

const handleViewChange = (tagInput: Highlightable, backdrop: HTMLElement) => {
	const handler = () => {
		backdrop.scrollTop = tagInput.scrollTop;
		backdrop.style.width = tagInput.clientWidth + "px";
		backdrop.style.height = tagInput.clientHeight + "px";
	};

	onDisplayChange(tagInput, handler);
	tagInput.addEventListener("scroll", handler);
	tagInput.addEventListener("resize", handler);
	return handler();
};

const highlighted = (element: Highlightable, highlight: (value: string) => Promise<Highlight[]>): HTMLDivElement => {
	const parent = element.parentElement;
	const {highlighter, backdrop} = createHighlighterComponents();
	parent.insertAdjacentElement("afterbegin", backdrop);
	handleViewChange(element, backdrop);
	handleInput(element, highlighter, highlight);
	return backdrop;
};

export type {Highlight, Highlightable};
export {highlighted};
