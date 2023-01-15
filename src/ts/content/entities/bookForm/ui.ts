const show = (element: Element) => {
	// LibraryThing collections checkboxes are sometimes hidden beneath a div that is not visible
	// THIS IS BRITTLE and relies on the specific markup tree of LibraryThing
	const hiddenAncestor = element.closest<HTMLElement>('div[style="display:none;"]');
	if (hiddenAncestor) {
		hiddenAncestor.style.display = "";
	}
};

export {show};
