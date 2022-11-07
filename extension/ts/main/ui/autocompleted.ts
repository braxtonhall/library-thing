import {debounce} from "../util/debounce";

type Autocompletable = HTMLTextAreaElement | HTMLInputElement;

interface AutocompleteOptions<T extends Autocompletable> {
	element: T;
	getMatches: (value: string, selectionStart: number) => Promise<string[]>;
	onSelection: (match: string) => void;
}

const autocompleted = <T extends Autocompletable>({element, getMatches, onSelection}: AutocompleteOptions<T>): T => {
	let selection = -1;
	let entries = [];

	const autocompleteList = document.createElement("div");
	autocompleteList.className = "autocomplete-list";

	const toAutocompleteEntry = (match: string): HTMLDivElement => {
		const div = document.createElement("div");
		div.innerText = match;
		div.addEventListener("click", () => {
			closeAllLists();
			onSelection(match);
		});
		return div;
	};

	element.addEventListener(
		"input",
		debounce(async () => {
			closeAllLists();
			const {value, selectionStart} = element;
			const matches = await getMatches(value, selectionStart);

			if (matches.length > 0) {
				element.appendChild(autocompleteList);
				entries = matches.map(toAutocompleteEntry);
				autocompleteList.append(...entries);
			}
		}, 100)
	);

	const moveSelection = (code: "ArrowUp" | "ArrowDown", {length}: {length: number}) => {
		if (length) {
			selection += code === "ArrowDown" ? 1 : -1;
			selection %= length;
		}
	};

	element.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.code == "ArrowDown" || event.code == "ArrowUp") {
			removeActive(entries[selection]);
			moveSelection(event.code, entries);
			addActive(entries[selection]);
		} else if (event.code == "Enter") {
			entries[selection]?.click();
		}
	});

	const addActive = (div: HTMLDivElement) => div.classList.add("autocomplete-active");
	const removeActive = (div: HTMLDivElement) => div.classList.remove("autocomplete-active");

	const closeAllLists = () => {
		selection = -1;
		autocompleteList.replaceChildren();
	};

	element.addEventListener("click", (event) => event.stopPropagation());
	document.addEventListener("click", closeAllLists);

	// again proOOOBably shouldn't do this
	element.style.position = "relative";
	return element;
};

export {autocompleted};
