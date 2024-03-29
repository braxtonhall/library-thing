import {createModal} from "../../../../common/ui/modal";
import {getInput, renderAuthorTags} from "./authorUI";
import {showToast, ToastType} from "../../../../common/ui/toast";
import {loaderOverlaid} from "../../../../common/ui/loadingIndicator";
import {authorTagsFromBooksWhere, getAuthorInfo} from "./util";
import Author from "../../../adapters/author";
import {UIColour} from "../../../../common/ui/colour";
import {getAuthorPageBooks} from "./getAuthorPageBooks";

interface PullData {
	certainTags: Set<string>;
	uncertainTags: Set<string>;
	name: string;
}

const SINGULAR_STRINGS = {some: "an", s: "", them: "it", all: ""};
const PLURAL_STRINGS = {some: "some", s: "s", them: "them", all: " all"};

const pluralityStrings = (isPlural: boolean) => (isPlural ? PLURAL_STRINGS : SINGULAR_STRINGS);

const uncertainTagModal =
	(strings: typeof SINGULAR_STRINGS, {certainTags, uncertainTags}: PullData) =>
	() =>
		createModal({
			text: `Additional tag${strings.s}`,
			subText: [...uncertainTags],
			colour: UIColour.BLUE,
			elements: [
				{
					kind: "button",
					text: `Add${strings.all}`,
					colour: UIColour.RED,
					onClick: async () => renderAuthorTags([...certainTags, ...uncertainTags]),
				},
				{kind: "button", text: "Back", colour: UIColour.BLUE},
			],
		});

const alertUncertain = (pullData: PullData) => {
	const {uncertainTags, name} = pullData;
	const strings = pluralityStrings(uncertainTags.size !== 1);

	return showToast(
		`Found ${strings.some} additional tag${strings.s} that may or may not be associated with ${name}. Click here to see ${strings.them}.`,
		ToastType.INFO,
		uncertainTagModal(strings, pullData)
	);
};

const finishPull = (pullData: PullData) => {
	if (pullData.uncertainTags.size > 0) {
		return alertUncertain(pullData);
	} else {
		return showToast("Done!", ToastType.SUCCESS);
	}
};

const onPull = async () =>
	loaderOverlaid(async (): Promise<PullData> => {
		const {uuid, name} = getAuthorInfo();
		const [author, books] = await Promise.all([Author.getAuthor(uuid), getAuthorPageBooks(uuid)]);
		const singleAuthorTags = authorTagsFromBooksWhere(books, (book) => book.authorIds.length === 1);
		const multiAuthorTags = authorTagsFromBooksWhere(books, (book) => book.authorIds.length !== 1);
		const certainTags = new Set([...getInput(), ...(author?.tags ?? []), ...singleAuthorTags]);
		const uncertainTags = new Set(multiAuthorTags.filter((tag) => !certainTags.has(tag)));
		renderAuthorTags([...certainTags]);
		return {certainTags, uncertainTags, name};
	}).then(finishPull);

export {onPull};
