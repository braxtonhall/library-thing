import {getAllTags, getAncestry} from "../../adapters/tags";
import {createModal} from "../../../common/ui/modal";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {UIColour} from "../../../common/ui/colour";
import {OnSave, OffSave} from "../../entities/bookForm";
import {Highlight, highlighted} from "../../../common/ui/highlighter";

declare const SPREADSHEET_ID: string; // set by webpack

type GetTagsOptions = {noCache: boolean};

const applyHighlights = async (text: string): Promise<Highlight[]> => {
	const validTags = await getAllTags();
	return text
		.split(",")
		.flatMap((part) => {
			const trimmedPart = part.trim();
			if (validTags.has(trimmedPart) || !trimmedPart) {
				return [part, ","];
			} else {
				const highlightedPart: Highlight = {highlight: true, text: trimmedPart};
				if (trimmedPart === part) {
					return [highlightedPart, ","];
				} else {
					const [before, after] = part.split(trimmedPart);
					return [before, highlightedPart, after, ","];
				}
			}
		})
		.slice(0, -1); // Remove the trailing comma
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
	const tagInput = document.getElementById("form_tags") as HTMLTextAreaElement;
	if (tagInput) {
		const saveButtonListener = () => handleSave(tagInput, {noCache: false});

		const backdrop = highlighted(tagInput, applyHighlights);

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
