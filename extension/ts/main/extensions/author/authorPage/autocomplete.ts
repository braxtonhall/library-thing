import {autocompleted} from "../../../ui/autocompleted";
import {getTagsIncluding} from "../../../adapters/tags";

interface Options {
	container: HTMLDivElement;
	input: HTMLInputElement;
}

const getSelectedWord = (words: string[], selection: number): string => {
	const [first, ...rest] = words;
	if (first === undefined) {
		return "";
	} else {
		if (selection <= first.length) {
			return first;
		} else {
			return getSelectedWord(rest, selection - (first.length + 1));
		}
	}
};

const replaceSelectedWord = (words: string[], selection: number, replacement: string): string[] => {
	const [first, ...rest] = words;
	if (first === undefined) {
		return [];
	} else {
		if (selection <= first.length) {
			return [replacement, ...rest];
		} else {
			return [first, ...replaceSelectedWord(rest, selection - (first.length + 1), replacement)];
		}
	}
};

const autocomplete = ({container, input}: Options) =>
	autocompleted({
		container,
		input,
		newValue: (match, value, selectionStart) => {
			const parts = value.split(",");
			return replaceSelectedWord(parts, selectionStart, ` ${match}`).join(",").trim();
		},
		getMatches: async (value, selectionStart) => {
			const parts = value.split(",");
			const word = getSelectedWord(parts, selectionStart).trim();
			if (word) {
				return getTagsIncluding(word, {match: / [aA]uthor$/});
			} else {
				return [];
			}
		},
	});

export {autocomplete};
