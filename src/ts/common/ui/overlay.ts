import "../../../sass/overlay.sass";

const OVERLAY_CLASS_NAME = "better-library-thing-overlay";
const OVERLAY_ID = "better-library-thing-overlay-id";

const createOverlay = () => {
	const element = document.createElement("div");
	element.id = OVERLAY_ID;
	element.className = OVERLAY_CLASS_NAME;
	return element;
};

const removeOverlay = () => {
	const overlay = document.getElementById(OVERLAY_ID);
	if (overlay) {
		document.body.removeChild(overlay);
	}
};

const isOverlayRendered = () => !!document.getElementById(OVERLAY_ID);

export {createOverlay, removeOverlay, isOverlayRendered};
