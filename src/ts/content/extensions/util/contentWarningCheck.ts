import {OffSave, OnSave} from "../../entities/bookForm";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {getTagsFromElement, getTagTrees, TagTrees} from "../../adapters/tags";
import {createModal} from "../../../common/ui/modal";
import {UIColour} from "../../../common/ui/colour";

const contentWarningIsPresent = (commentsTextArea: HTMLTextAreaElement): boolean =>
	commentsTextArea.value
		.toLowerCase()
		.split("\n")
		.some((line) => line.startsWith("cw:"));

const saveContentWarning = (commentsTextArea: HTMLTextAreaElement, contentWarning: string): void => {
	const cleanedWarning = contentWarning.replace(/^CW:\s*/i, "");
	commentsTextArea.value = `CW: ${cleanedWarning}\n${commentsTextArea.value}`;
	commentsTextArea.dispatchEvent(new Event("change"));
};

const handleContentWarning = async (
	tagsRequiringWarning: string[],
	commentsTextArea: HTMLTextAreaElement
): Promise<boolean> => {
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
							saveContentWarning(commentsTextArea, userText);
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
const getWarningRequiredTags = (commentsTextArea: HTMLTextAreaElement, tags: string[], trees: TagTrees): string[] => {
	if (contentWarningIsPresent(commentsTextArea)) {
		return [];
	} else {
		return tags.filter((tag) => !!trees.get(tag.toLowerCase())?.warning);
	}
};

const checkTags = async (tagInput: HTMLTextAreaElement, commentsTextArea: HTMLTextAreaElement): Promise<string[]> =>
	loaderOverlaid(async () => {
		const trees = await getTagTrees();
		const userTags = getTagsFromElement(tagInput);
		return getWarningRequiredTags(commentsTextArea, userTags, trees);
	});

const handleSave = (tagsTextArea: HTMLTextAreaElement, commentsTextArea: HTMLTextAreaElement): Promise<boolean> =>
	checkTags(tagsTextArea, commentsTextArea).then((warningRequiredTags) => {
		if (warningRequiredTags.length > 0) {
			return handleContentWarning(warningRequiredTags, commentsTextArea);
		} else {
			return true;
		}
	});

const appendContentWarningChecker = (
	onSave: OnSave,
	offSave: OffSave,
	tagsTextArea: HTMLTextAreaElement,
	commentsTextArea: HTMLTextAreaElement
) => {
	const saveButtonListener = () => handleSave(tagsTextArea, commentsTextArea);
	const showContentWarningCheck = () => onSave(saveButtonListener);
	const hideContentWarningCheck = () => offSave(saveButtonListener);
	return {showContentWarningCheck, hideContentWarningCheck};
};

export {appendContentWarningChecker};
