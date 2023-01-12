import {createModal} from "../../../../../common/ui/modal";
import {UIColour} from "../../../../../common/ui/colour";
import {insertTags} from "./insertTags";
import {getSheetLink} from "../../../../../common/entities/spreadsheet";
import {GetTagsOptions} from "../types";

const getUserAcceptance = (
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
				{
					kind: "button",
					text: "Insert Tags",
					colour: UIColour.GREY,
					onClick: async () => resolve(insertTags(invalidTags).then(() => saveHandler({noCache: true}))),
				},
				{kind: "button", text: "Save anyway", colour: UIColour.GREY, onClick: async () => resolve(true)},
				{kind: "button", text: "Cancel", colour: UIColour.PURPLE, onClick: async () => resolve(false)},
			],
			colour: UIColour.PURPLE,
			onCancel: async () => resolve(false),
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
			onCancel: async () => resolve(false),
		})
	);
};

export {getUserAcceptance};
