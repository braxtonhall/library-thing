import "../../../sass/loader.sass";

import {createOverlay} from "./overlay";
import {UIColour} from "./colour";

const LOADER_CLASS_NAME = "better-library-thing-loader";

const createLoader = (colour: UIColour) => {
	const overlay = createOverlay();

	const loader = document.createElement("div");
	loader.className = `${LOADER_CLASS_NAME} ${colour}`;

	overlay.appendChild(loader);
	document.body.appendChild(overlay);

	return overlay;
};

const removeLoader = (overlay: HTMLDivElement) => {
	document.body.removeChild(overlay);
};

const loaderOverlaid = async <T>(callback: () => Promise<T>, colour = UIColour.PURPLE): Promise<T> => {
	const overlay = createLoader(colour);
	try {
		return await callback();
	} finally {
		removeLoader(overlay);
	}
};

export {loaderOverlaid};
