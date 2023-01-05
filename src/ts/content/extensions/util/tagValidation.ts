import {getTagsFromElement, getTagTrees, TagTrees} from "../../adapters/tags";
import {createModal} from "../../../common/ui/modal";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {UIColour} from "../../../common/ui/colour";
import {OnSave, OffSave} from "../../entities/bookForm";
import {Highlight, Highlightable, highlighted} from "../../../common/ui/highlighter";
import {getSheetLink} from "../../../common/entities/spreadsheet";

type GetTagsOptions = {noCache: boolean};
type TagCheck = {invalidTags: string[]; warningRequiredTags: string[]};

const applyHighlights = async (text: string): Promise<Highlight[]> => {
	const validTags = await getTagTrees().catch(() => new Map());
	return text
		.split(",")
		.flatMap((part) => {
			const trimmedPart = part.trim();
			if (!trimmedPart || validTags.has(trimmedPart.toLowerCase())) {
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

const contentWarningIsPresent = (): boolean => {
	return false; // TODO
};

const getInvalidTags = (tags: string[], trees: TagTrees): string[] =>
	tags.filter((tag) => !trees.has(tag.toLowerCase()));

const getWarningRequiredTags = (tags: string[], trees: TagTrees): string[] => {
	if (contentWarningIsPresent()) {
		return [];
	} else {
		return tags.filter((tag) => !!trees.get(tag.toLowerCase())?.warning);
	}
};

const getInvalidTagsUserAcceptance = (
	invalidTags: string[],
	saveHandler: (options: GetTagsOptions) => Promise<boolean>
): Promise<boolean> =>
	new Promise<boolean>((resolve) =>
		createModal({
			text: "Are you sure? The following tags are not in the Tag Index",
			subText: invalidTags,
			elements: [
				{
					kind: "button",
					text: "Open the Tag Index",
					colour: UIColour.GREY,
					onClick: async () => resolve(getSecondaryAcceptance(saveHandler)),
				},
				{kind: "button", text: "Save anyway", colour: UIColour.GREY, onClick: async () => resolve(true)},
				{kind: "button", text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
			],
			colour: UIColour.PURPLE,
		})
	);

const getSecondaryAcceptance = async (saveHandler: (options: GetTagsOptions) => Promise<boolean>): Promise<boolean> => {
	window.open(await getSheetLink());
	return new Promise<boolean>((resolve) =>
		createModal({
			text: "Did you put the new tags in the Tag Index?",
			elements: [
				{
					kind: "button",
					text: "Yes!",
					colour: UIColour.GREY,
					onClick: async () => resolve(saveHandler({noCache: true})),
				},
				{kind: "button", text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
			],
			colour: UIColour.PURPLE,
		})
	);
};

const fixTagsCase = (tags: string[], trees: TagTrees): string[] =>
	tags.map((tag) => trees.get(tag.toLowerCase())?.tag ?? tag);

const setTags = (tagInput: Highlightable, tags: Iterable<string>) => {
	tagInput.value = [...tags].join(", ");
	tagInput.dispatchEvent(new Event("change"));
};

const saveContentWarning = (contentWarning: string): void => {
	console.log(contentWarning);
};

const checkTags = async (tagInput: Highlightable, options: GetTagsOptions): Promise<TagCheck> =>
	loaderOverlaid(async () => {
		const trees = await getTagTrees(options);
		const userTags = getTagsFromElement(tagInput);
		const properCaseTags = fixTagsCase(userTags, trees);
		setTags(tagInput, properCaseTags);
		const invalidTags = getInvalidTags(properCaseTags, trees);
		const warningRequiredTags = getWarningRequiredTags(properCaseTags, trees);
		return {invalidTags, warningRequiredTags};
	});

const handleContentWarning = async (tagsRequiringWarning: string[]): Promise<boolean> => {
	if (tagsRequiringWarning.length > 0) {
		return new Promise<boolean>((resolve) =>
			createModal({
				text: "Don't forget a Content Warning. The following tags require a Content Warning",
				subText: tagsRequiringWarning,
				elements: [
					{
						kind: "input",
						placeholder: "Enter a content warning",
						ensureNonEmpty: true,
						text: "Save",
						colour: UIColour.GREY,
						onSelect: async (userText) => {
							saveContentWarning(userText);
							resolve(true);
						},
					},
					{kind: "button", text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
				],
				colour: UIColour.PURPLE,
			})
		);
	} else {
		return true;
	}
};

const handleSave = (tagInput: Highlightable, options: GetTagsOptions) => {
	const saveHandler = (options: GetTagsOptions): Promise<boolean> =>
		checkTags(tagInput, options).then(({invalidTags, warningRequiredTags}) => {
			if (invalidTags.length > 0) {
				return getInvalidTagsUserAcceptance(invalidTags, saveHandler);
			} else {
				return handleContentWarning(warningRequiredTags);
			}
		});
	return saveHandler(options);
};

const appendTagValidator = (onSave: OnSave, offSave: OffSave, input: Highlightable) => {
	const backdrop = highlighted(input, applyHighlights);
	const saveButtonListener = () => handleSave(input, {noCache: false});
	const showTagValidator = () => {
		input.dispatchEvent(new Event("change"));
		onSave(saveButtonListener);
		backdrop.style.display = "";
	};
	const hideTagValidator = () => {
		offSave(saveButtonListener);
		backdrop.style.display = "none";
	};
	return {showTagValidator, hideTagValidator};
};

export {appendTagValidator};
