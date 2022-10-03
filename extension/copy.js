const COLLECTIONS_ID_PREFIX = "collection_u_";
const SAVE_DATA_KEY = "_save-data";
const COLLECTIONS_KEY = "___collections_";

const saveData = (parent) =>
	(event) => {
		event.preventDefault();
		localStorage.setItem(SAVE_DATA_KEY, JSON.stringify(getSaveData(parent)));
	};

const loadData = (parent) =>
	(event) => {
		event.preventDefault();
		const saveData = JSON.parse(localStorage.getItem(SAVE_DATA_KEY));
		insertSaveData(parent, saveData);
	};

const getSaveData = (parent) => {
	const elements = getElementsByTags(parent, RELEVANT_TAGS);
	return elements.reduce((saveData, element) => {
		// We can't change hidden elements because LibraryThing relies
		// on hidden form inputs to send additional, form-specific metadata
		// on save
		if (element.id && element.type !== 'hidden') {
			const {value, checked} = element;
			if (element.id.startsWith(COLLECTIONS_ID_PREFIX)) {
				const collections = saveData[COLLECTIONS_KEY] || {};
				const [span] = element.parentElement.getElementsByTagName("span");
				collections[span.textContent] = {value, checked};
				saveData[COLLECTIONS_KEY] = collections;
			} else {
				saveData[element.id] = {value, checked};
			}
		}
		return saveData;
	}, {});
};

const insertSaveData = (parent, saveData) => {
	const elements = getElementsByTags(parent, RELEVANT_TAGS);
	return elements.forEach((element) => {
		// We can't change hidden elements because LibraryThing relies
		// on hidden form inputs to send additional, form-specific metadata
		// on save
		if (element.id && element.type !== 'hidden') {
			let saveElement = element;
			if (element.id.startsWith(COLLECTIONS_ID_PREFIX)) {
				const [span] = element.parentElement.getElementsByTagName("span");
				saveElement = saveData[COLLECTIONS_KEY][span.textContent] || element;
			} else {
				saveElement = saveData[element.id] || element;
				
			}
			element.value = saveElement.value;
			element.checked = saveElement.checked;
		}
	});
};

const appendButton = (element, text, onClick) => {
	const button = document.createElement("button");
	button.innerHTML = text;
	button.addEventListener("click", onClick);
	const td = document.createElement("td");
	td.appendChild(button);
	element.appendChild(td);
};

const appendRow = (editForm) => (table) => {
	const row = document.createElement("tr");
	appendButton(row, 'SAVE', saveData(editForm));
	appendButton(row, 'LOAD', loadData(editForm));
	const [body] = table.getElementsByTagName("tbody");
	body.appendChild(row);
};

window.addEventListener("load", () => {
	const [editForm] = document.getElementsByClassName("book_bit");
	Array.from(document.getElementsByClassName("book_bitTable")).forEach(appendRow(editForm));
});
