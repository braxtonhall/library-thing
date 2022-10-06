// semantically, this isn't actually a button, but who am i to question the choices of LibraryThing
const createButton = (
	buttonText: string,
	imgSrc: string,
	onClick: (event: MouseEvent) => void
): HTMLTableCellElement => {
	const td = document.createElement("td");
	td.className = "book_bitItem";
	const img = document.createElement("img");
	img.src = chrome.runtime.getURL(imgSrc);
	const span = document.createElement("span");
	span.innerHTML = buttonText;
	span.className = "book_editTabText";
	span.style.marginLeft = "4px";
	span.style.color = "#6A5546";
	td.addEventListener("click", onClick);
	td.appendChild(img);
	td.appendChild(span);
	return td;
};

export {createButton};
