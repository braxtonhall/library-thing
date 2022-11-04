import "../../../sass/tags.sass";

import {onFormRender} from "../entities/bookForm";
import {isValidTag} from "../adapters/tags";

const createHighlighterComponents = () => {
	const highlighter = document.createElement("div");
	highlighter.className = "bookEditInput"; // this comes from LibraryThing. Stealing their css
	highlighter.id = "vbl-text-highlighter";

	const backdrop = document.createElement("div");
	backdrop.id = "vbl-text-backdrop";
	backdrop.append(highlighter);

	return {highlighter, backdrop};
};

const applyHighlights = async (text: string): Promise<string> => {
	const futureParts = text.split(",").map(async (part) => {
		const trimmedPart = part.trim();
		if (await isValidTag(trimmedPart)) {
			return part;
		} else {
			const mark = document.createElement("mark");
			mark.innerText = trimmedPart;
			return part.replace(trimmedPart, mark.outerHTML);
		}
	});
	const parts = await Promise.all(futureParts);
	return parts.join(",") + "\n";
};

const handleInput = (tagInput: HTMLTextAreaElement, highlighter: HTMLElement) => {
	const handler = async () => (highlighter.innerHTML = await applyHighlights(tagInput.value));
	tagInput.addEventListener("input", handler);
	tagInput.addEventListener("change", handler);
	return handler();
};

const handleViewChange = (tagInput: HTMLTextAreaElement, backdrop: HTMLElement) => {
	const handler = () => {
		backdrop.scrollTop = tagInput.scrollTop;
		backdrop.style.width = tagInput.clientWidth + "px";
		backdrop.style.height = tagInput.clientHeight + "px";
	};
	tagInput.addEventListener("scroll", handler);
	tagInput.addEventListener("resize", handler);
	return handler();
};

onFormRender(() => {
	const tagInputContainer = document.getElementById("bookedit_tags");
	const tagInput = document.getElementById("form_tags") as HTMLTextAreaElement;
	if (tagInput && tagInputContainer) {
		const {highlighter, backdrop} = createHighlighterComponents();
		tagInputContainer.insertAdjacentElement("afterbegin", backdrop);
		handleViewChange(tagInput, backdrop);
		return handleInput(tagInput, highlighter);
	}
});
