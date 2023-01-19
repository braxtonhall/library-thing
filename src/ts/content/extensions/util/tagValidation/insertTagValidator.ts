import {getTagsFromElement, getTagTrees, TagNodes} from "../../../adapters/tags";
import {loaderOverlaid} from "../../../../common/ui/loadingIndicator";
import {OffSave, OnSave} from "../../../entities/bookForm";
import {Highlight, Highlightable, highlighted} from "../../../../common/ui/highlighter";
import {getUserAcceptance} from "./dialogs/userAcceptance";
import {GetTagsOptions} from "./types";
import {onLogged} from "../onLogged";

const applyHighlights = async (text: string): Promise<Highlight[]> => {
	const {nodes: validTags} = await getTagTrees().catch(() => ({nodes: new Map()}));
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

const getInvalidTags = (tags: string[], trees: TagNodes): string[] =>
	tags.filter((tag) => !trees.has(tag.toLowerCase()));

const fixTagsCase = (tags: string[], trees: TagNodes): string[] =>
	tags.map((tag) => trees.get(tag.toLowerCase())?.name ?? tag);

const setTags = (tagInput: Highlightable, tags: Iterable<string>) => {
	tagInput.value = [...tags].join(", ");
	tagInput.dispatchEvent(new Event("change"));
};

const checkTags = async (tagInput: Highlightable, options: GetTagsOptions) =>
	loaderOverlaid(async () => {
		const {nodes} = await getTagTrees(options);
		const userTags = getTagsFromElement(tagInput);
		const properCaseTags = fixTagsCase(userTags, nodes);
		setTags(tagInput, properCaseTags);
		return getInvalidTags(properCaseTags, nodes);
	});

const handleSave = (tagInput: Highlightable, options: GetTagsOptions) => {
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

const insertTagValidator = (onSave: OnSave, offSave: OffSave, input: Highlightable) => {
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
	hideTagValidator(); // Do it now so things don't pop in and out
	return onLogged({
		onLogIn: showTagValidator,
		onLogOut: hideTagValidator,
	});
};

export {insertTagValidator};
