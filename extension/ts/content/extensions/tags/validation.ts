import {getAllTags, getAncestry} from "../../adapters/tags";
import {createModal} from "../../../common/ui/modal";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {UIColour} from "../../../common/ui/colour";
import {OnSave, OffSave} from "../../entities/bookForm";

declare const SPREADSHEET_ID: string; // set by webpack

type GetTagsOptions = {noCache: boolean};

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

const handleInput = (tagInput: HTMLTextAreaElement, highlighter: HTMLElement): void => {
	const handler = async () => (highlighter.innerHTML = await applyHighlights(tagInput.value));
	tagInput.addEventListener("input", handler);
	tagInput.addEventListener("change", handler);
	handler();
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

const getInvalidTags = async (tags: string[], options: GetTagsOptions): Promise<string[]> => {
	const validTags = await getAllTags(options);
	return tags.filter((tag) => !validTags.has(tag));
};

const getUserAcceptance = (
	invalidTags: string[],
	saveHandler: (options: GetTagsOptions) => Promise<boolean>
): Promise<boolean> =>
	new Promise<boolean>((resolve) =>
		createModal({
			text: "Are you sure? The following tags are not in the Tag Index",
			subText: invalidTags,
			buttons: [
				{
					text: "Open the Tag Index",
					colour: UIColour.GREY,
					onClick: async () => resolve(getSecondaryAcceptance(saveHandler)),
				},
				{text: "Save anyway", colour: UIColour.GREY, onClick: async () => resolve(true)},
				{text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
			],
			colour: UIColour.PURPLE,
		})
	);

const getSecondaryAcceptance = (saveHandler: (options: GetTagsOptions) => Promise<boolean>): Promise<boolean> => {
	window.open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`);
	return new Promise<boolean>((resolve) =>
		createModal({
			text: "Did you put the new tags in the Tag Index?",
			buttons: [
				{text: "Yes!", colour: UIColour.GREY, onClick: async () => resolve(saveHandler({noCache: true}))},
				{text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
			],
			colour: UIColour.PURPLE,
		})
	);
};

const getTags = (tagInput: HTMLTextAreaElement) => tagInput.value.split(",").map((part) => part.trim());

const getAncestorTags = async (tags: string[]): Promise<Set<string>> => {
	const futureAncestors = tags.map((tag) => getAncestry(tag));
	const ancestors = await Promise.all(futureAncestors);
	return new Set([...tags, ...ancestors.flat()]);
};

const setTags = (tagInput: HTMLTextAreaElement, tags: Iterable<string>) => {
	tagInput.value = [...tags].join(", ");
	tagInput.dispatchEvent(new Event("change"));
};

const checkTags = async (tagInput: HTMLTextAreaElement, options: GetTagsOptions) =>
	loaderOverlaid(async () => {
		setTags(tagInput, await getAncestorTags(getTags(tagInput)));
		return getInvalidTags(getTags(tagInput), options);
	});

const handleSave = (tagInput: HTMLTextAreaElement, options: GetTagsOptions) => {
	const saveHandler = (options: GetTagsOptions): Promise<boolean> =>
		checkTags(tagInput, options).then((invalidTags) => {
			if (invalidTags.length > 0) {
				return getUserAcceptance(invalidTags, saveHandler);
			} else {
				return true;
			}
		});
	return saveHandler(options);
};

const appendTagValidator = (onSave: OnSave, offSave: OffSave) => {
	const tagInputContainer = document.getElementById("bookedit_tags");
	const tagInput = document.getElementById("form_tags") as HTMLTextAreaElement;
	if (tagInput && tagInputContainer) {
		const {highlighter, backdrop} = createHighlighterComponents();
		tagInputContainer.insertAdjacentElement("afterbegin", backdrop);
		const saveButtonListener = () => handleSave(tagInput, {noCache: false});
		handleViewChange(tagInput, backdrop);
		handleInput(tagInput, highlighter);

		const showTagValidator = () => {
			onSave(saveButtonListener);
			backdrop.style.display = "";
		};
		const hideTagValidator = () => {
			offSave(saveButtonListener);
			backdrop.style.display = "none";
		};

		return {showTagValidator, hideTagValidator};
	} else {
		throw new Error("appendTagValidator should not have been called on this page");
	}
};

export {appendTagValidator};
