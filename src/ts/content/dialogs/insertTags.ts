import {createModal} from "../../common/ui/modal";
import {UIColour} from "../../common/ui/colour";

const insertTags = async (tags: string[]): Promise<boolean> => {
	if (tags.length === 0) {
		return Promise.resolve(true);
	} else {
		return new Promise<boolean>((resolve) =>
			createModal({
				text: "Which tag would you like to insert?",
				elements: tags.map((tag) => ({
					kind: "button",
					colour: UIColour.BLUE,
					text: tag,
					onClick: async () => {
						resolve(insertTag(tag, tags).then(insertTags));
					},
				})),
				colour: UIColour.BLUE,
				onCancel: async () => resolve(false),
			})
		);
	}
};

const insertTag = (tag: string, remainingTags: string[]): Promise<string[]> =>
	new Promise<string[]>((resolve) =>
		createModal({
			text: "Where would you like to insert this tag?",
			elements: [
				{
					kind: "button",
					text: "Here",
					colour: UIColour.GREEN,
					onClick: async () => resolve(remainingTags.filter((otherTag) => otherTag !== tag)),
				},
				{kind: "button", text: "Not Here", colour: UIColour.RED, onClick: async () => resolve(remainingTags)},
			],
			colour: UIColour.BLUE,
			onCancel: async () => resolve(remainingTags),
		})
	);

export {insertTags};
