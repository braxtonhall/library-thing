import "../../sass/overlay.sass";

const OVERLAY_CLASS_NAME = "better-library-thing-overlay";

const createOverlay = () => {
	const element = document.createElement("div");
	element.className = OVERLAY_CLASS_NAME;
	return element;
};

export {createOverlay};
