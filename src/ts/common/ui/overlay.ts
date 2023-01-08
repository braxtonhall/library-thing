import "../../../sass/overlay.sass";

const OVERLAY_CLASS_NAME = "better-library-thing-overlay";

const createOverlay = () => {
	const element = document.createElement("div");
	element.className = OVERLAY_CLASS_NAME;
	return element;
};

const clearOverlays = () => {
	const overlays = document.getElementsByClassName(OVERLAY_CLASS_NAME);
	Array.from(overlays).forEach((overlay) => overlay.remove());
};

export {createOverlay, clearOverlays};
