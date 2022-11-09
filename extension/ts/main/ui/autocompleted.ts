import "../../../sass/autocomplete.sass";

import {debounce} from "../util/debounce";

interface AutocompleteOptions<T extends HTMLElement> {
	container: T;
	input: HTMLInputElement | HTMLTextAreaElement;
	getMatches: (value: string, selectionStart: number) => Promise<string[]>;
	newValue: (match: string, value: string, selectionStart: number) => string;
}

const autocompleted = <T extends HTMLElement>({container, input, getMatches, newValue}: AutocompleteOptions<T>): T => {
	let entries = [];

	const autocompleteList = document.createElement("div");
	autocompleteList.className = "autocomplete-list";

	const toAutocompleteEntry = (match: string): HTMLDivElement => {
		const div = document.createElement("div");
		div.innerText = match;
		div.addEventListener("click", () => {
			const {value, selectionStart} = input;
			closeAllLists();
			input.value = newValue(match, value, selectionStart);
			input.focus();
		});
		return div;
	};

	input.addEventListener(
		"input",
		debounce(async () => {
			closeAllLists();
			const {value, selectionStart} = input;
			const matches = await getMatches(value, selectionStart);

			if (matches.length > 0) {
				container.appendChild(autocompleteList);
				entries = matches.map(toAutocompleteEntry);
				autocompleteList.replaceChildren(...entries);
			}
		}, 100)
	);

	const closeAllLists = () => autocompleteList.replaceChildren();

	container.addEventListener("click", (event) => event.stopPropagation());
	document.addEventListener("click", closeAllLists);

	// again proOOOBably shouldn't do this
	container.style.position = "relative";
	return container;
};

export {autocompleted};
