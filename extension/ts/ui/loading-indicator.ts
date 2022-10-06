import {styleInject, styleRemove} from "./ui-utils";

export const createLoader = () => {
	const overlay = document.createElement("div");
	overlay.id = `better-library-thing-loader-overlay`;

	const loader = document.createElement("div");
	loader.id = `better-library-thing-loader`;

	const style = styleInject(`
		#${overlay.id} {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 0, 0, 0.1);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10;
		}

		#${loader.id} {
			border: 16px solid #f3f3f3;
			border-top: 16px solid #A15CA0;
			border-radius: 50%;
			width: 50px;
			height: 50px;
			animation: spin 2s linear infinite;
		}

		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	`);

	overlay.appendChild(loader);
	document.body.appendChild(overlay);

	return {overlay, style};
};

export const removeLoader = (overlay: HTMLDivElement, style: HTMLStyleElement) => {
	document.body.removeChild(overlay);
	styleRemove(style);
};
