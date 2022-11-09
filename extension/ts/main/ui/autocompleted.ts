import "../../../sass/autocomplete.sass";

import {debounce} from "../util/debounce";

interface AutocompleteOptions<T extends HTMLElement> {
	container: T;
	input: HTMLInputElement | HTMLTextAreaElement;
	getMatches: (value: string, selectionStart: number) => Promise<string[]>;
	onSelection: (match: string, value: string, selectionStart: number) => void;
}

const autocompleted = <T extends HTMLElement>({
	container,
	input,
	getMatches,
	onSelection,
}: AutocompleteOptions<T>): T => {
	let entries = [];

	const autocompleteList = document.createElement("div");
	autocompleteList.className = "autocomplete-list";

	const toAutocompleteEntry = (match: string): HTMLDivElement => {
		const div = document.createElement("div");
		div.innerText = match;
		div.addEventListener("click", () => {
			const {value, selectionStart} = input;
			closeAllLists();
			onSelection(match, value, selectionStart);
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
				autocompleteList.append(...entries);
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