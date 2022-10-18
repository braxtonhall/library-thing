const OVERLAY_CLASS_NAME = "better-library-thing-loader-overlay";
const LOADER_CLASS_NAME = "better-library-thing-loader";

const createLoader = () => {
	const overlay = document.createElement("div");
	overlay.className = OVERLAY_CLASS_NAME;

	const loader = document.createElement("div");
	loader.className = LOADER_CLASS_NAME;

	overlay.appendChild(loader);
	document.body.appendChild(overlay);

	return overlay;
};

const removeLoader = (overlay: HTMLDivElement) => {
	document.body.removeChild(overlay);
};

const loaderOverlaid = async <T>(callback: () => Promise<T>): Promise<T> => {
	const overlay = createLoader();
	try {
		return await callback();
	} finally {
		removeLoader(overlay);
	}
};

export {loaderOverlaid};
