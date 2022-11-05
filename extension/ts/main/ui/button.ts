// semantically, this isn't actually a button, but who am i to question the choices of LibraryThing
const createIconButton = (
	buttonText: string,
	imgSrc: string,
	onClick: (event: MouseEvent) => void,
	id?: string,
	title?: string
): HTMLTableCellElement => {
	const td = document.createElement("td");
	td.className = "book_bitItem";
	td.style.paddingLeft = "8px";
	const img = document.createElement("img");
	img.src = chrome.runtime.getURL(imgSrc);
	const span = document.createElement("span");
	span.innerHTML = buttonText;
	span.className = "book_editTabText";
	span.style.color = "#6A5546";
	td.addEventListener("click", onClick);
	const imgTd = document.createElement("td");
	imgTd.append(img);
	imgTd.style.paddingRight = "4px";
	const spanTd = document.createElement("td");
	spanTd.append(span);
	td.appendChild(imgTd);
	td.appendChild(spanTd);
	td.id = id ?? "";
	td.title = title ?? "";
	return td;
};

export {createIconButton};
