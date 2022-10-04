const getMasthead = (document: Document): HTMLElement => {
	const masthead = document.getElementById("masthead");
	if (masthead) {
		return masthead;
	} else {
		const frames = Array.from(document.getElementsByTagName("frame")) as HTMLIFrameElement[];
		return frames
			.map((frame) => getMasthead(frame.contentWindow.document))
			.find((masthead) => !!masthead);
	}
};

window.addEventListener("load", () => {
	const masthead = getMasthead(document);
	if (masthead) {
		masthead.style["transition"] = "500ms";
		masthead.style["filter"] = "saturate(0)";
	}
});
