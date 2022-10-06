const OVERLAY_CLASS_NAME = "better-library-thing-loader-overlay";
const LOADER_CLASS_NAME = "better-library-thing-loader";

export const createLoader = () => {
	const overlay = document.createElement("div");
	overlay.className = OVERLAY_CLASS_NAME;

	const loader = document.createElement("div");
	loader.className = LOADER_CLASS_NAME;

	overlay.appendChild(loader);
	document.body.appendChild(overlay);

	return overlay;
};

export const removeLoader = (overlay: HTMLDivElement) => {
	document.body.removeChild(overlay);
};
