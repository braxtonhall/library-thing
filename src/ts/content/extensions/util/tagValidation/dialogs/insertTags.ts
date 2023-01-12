import {UIColour} from "../../../../../common/ui/colour";
import {createModal, ModalButton} from "../../../../../common/ui/modal";
import {getTagTrees} from "../../../../adapters/tags";
import {loaderOverlaid} from "../../../../../common/ui/loadingIndicator";
import {TagRoot, TagTree} from "../../../../adapters/tags/types";

const tagToInsertionButton = (remainingTags: string[], resolve: (value) => void) => (tag: string) => ({
	kind: "button" as const,
	colour: UIColour.BLUE,
	text: tag,
	onClick: async () => resolve(insertTag(tag, remainingTags).then(insertTags)),
});

const insertTags = (tags: string[]): Promise<boolean> => {
	if (tags.length === 0) {
		return Promise.resolve(true);
	} else {
		return new Promise<boolean>((resolve) =>
			createModal({
				text: "Which tag would you like to insert?",
				elements: [
					...tags.map(tagToInsertionButton(tags, resolve)),
					{kind: "button", colour: UIColour.RED, text: "Back", onClick: async () => resolve(false)},
				],
				colour: UIColour.BLUE,
				onCancel: async () => resolve(false),
			})
		);
	}
};

const nodeToInsertionButton =
	(tag: string, remainingTags: string[], resolve: (value) => void) =>
	(node: TagRoot | TagTree): ModalButton => ({
		kind: "button",
		text: node.name,
		colour: UIColour.BLUE,
		onClick: async () => resolve(confirm(tag, remainingTags, node)),
	});

const confirm = (tag: string, remainingTags: string[], node: TagRoot | TagTree) =>
	new Promise<string[]>((resolve) =>
		createModal({
			text: `Insert "${tag}" under "${node.name}"?`,
			elements: [
				{
					kind: "button",
					text: "Yes",
					colour: UIColour.GREY,
					onClick: async () => resolve(remainingTags.filter((otherTag) => otherTag !== tag)),
				},
				{
					kind: "button",
					text: "Deeper",
					colour: UIColour.BLUE,
					onClick: async () => resolve(insertTagIntoOneOf(tag, remainingTags, node.children)),
				},
				{kind: "button", text: "Back", colour: UIColour.RED, onClick: async () => resolve(remainingTags)},
			],
			colour: UIColour.BLUE,
			onCancel: async () => resolve(remainingTags),
		})
	);

const insertTagIntoOneOf = (tag: string, remainingTags: string[], options: Array<TagRoot | TagTree>) =>
	new Promise<string[]>((resolve) =>
		createModal({
			text: "Where would you like to insert this tag?",
			elements: [
				...options.map(nodeToInsertionButton(tag, remainingTags, resolve)),
				{kind: "button", text: "Back", colour: UIColour.RED, onClick: async () => resolve(remainingTags)},
			],
			colour: UIColour.BLUE,
			onCancel: async () => resolve(remainingTags),
		})
	);

const insertTag = (tag: string, remainingTags: string[]): Promise<string[]> =>
	loaderOverlaid(getTagTrees).then(({roots}) => insertTagIntoOneOf(tag, remainingTags, roots));

export {insertTags};
