import "../../../sass/tags.sass";

import {onFormRender, onSave} from "../entities/bookForm";
import {getAllTags} from "../adapters/tags";
import {createModal, ModalColour} from "../ui/modal";
import {loaderOverlaid} from "../ui/loadingIndicator";

declare const SPREADSHEET_ID: string; // set by webpack

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
	const validTags = await getAllTags();
	const futureParts = text.split(",").map(async (part) => {
		const trimmedPart = part.trim();
		if (validTags.has(trimmedPart)) {
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

const getInvalidTags = async (tags: string[]): Promise<string[]> => {
	const validTags = await getAllTags({noCache: true});
	return tags.filter((tag) => !validTags.has(tag));
};

const getUserAcceptance = (invalidTags: string[], tagChecker: () => Promise<boolean>): Promise<boolean> =>
	new Promise<boolean>((resolve) =>
		createModal({
			text: "Are you sure? The following tags are not in the Tag Index",
			subText: invalidTags,
			buttons: [
				{
					text: "Open the Tag Index",
					colour: ModalColour.PURPLE,
					onClick: async () => resolve(getSecondaryAcceptance(tagChecker)),
				},
				{text: "Save anyway", colour: ModalColour.RED, onClick: async () => resolve(true)},
				{text: "Cancel", colour: ModalColour.BLUE, onClick: async () => resolve(false)},
			],
			colour: ModalColour.GREY,
		})
	);

const getSecondaryAcceptance = (tagChecker: () => Promise<boolean>): Promise<boolean> => {
	window.open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
	return new Promise<boolean>((resolve) =>
		createModal({
			text: "Did you put the new tags in the Tag Index?",
			buttons: [
				{text: "Yes!", colour: ModalColour.AMBER, onClick: async () => resolve(tagChecker())},
				{text: "Cancel", colour: ModalColour.BLUE, onClick: async () => resolve(false)},
			],
			colour: ModalColour.PURPLE,
		})
	);
};

const checkTags = (tagInput: HTMLTextAreaElement) => {
	const tagChecker = async (): Promise<boolean> => {
		const tags = tagInput.value.split(",").map((part) => part.trim());
		const invalidTags = await loaderOverlaid(() => getInvalidTags(tags));
		if (invalidTags.length > 0) {
			return getUserAcceptance(invalidTags, tagChecker);
		} else {
			return true;
		}
	};
	return tagChecker;
};

onFormRender(() => {
	const tagInputContainer = document.getElementById("bookedit_tags");
	const tagInput = document.getElementById("form_tags") as HTMLTextAreaElement;
	if (tagInput && tagInputContainer) {
		const {highlighter, backdrop} = createHighlighterComponents();
		tagInputContainer.insertAdjacentElement("afterbegin", backdrop);
		onSave(checkTags(tagInput));
		handleViewChange(tagInput, backdrop);
		return handleInput(tagInput, highlighter);
	}
});
