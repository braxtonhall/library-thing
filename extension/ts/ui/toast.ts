import {ToastType, ShowToastEvent} from "../types";
import {SHOW_TOAST_EVENT} from "../constants";
import {styleInject, styleRemove} from "./ui-utils";

const TOAST_DURATION_MS = 6000;
let toastCounter = 0;

const assertNever = () => {
	throw new Error("should never reach here");
};

const getToastBackgroundColour = (toastType: ToastType) => {
	switch (toastType) {
		case ToastType.ERROR:
			return "#FF6955";
		case ToastType.WARNING:
			return "#FFB82F";
		case ToastType.SUCCESS:
			return "#A0FF98";
		default:
			assertNever();
	}
};

const createToast = (toastType: ToastType) => {
	const toast = document.createElement("div");
	toast.id = `better-library-thing-toast-${toastCounter++}`;
	const backgroundColour = getToastBackgroundColour(toastType);
	const style = styleInject(`
		#${toast.id} {
			min-width: 400px; /* Set a default minimum width */
			margin-left: -200px; /* Divide value of min-width by 2 */
			text-align: center;
			font-weight: bold;
			border-radius: 8px; /* Rounded borders */
			padding: 16px;
			position: fixed; z-index: 99;
			left: 70%;
			top: 80px;
			color: #000;
			background-color: ${backgroundColour};
			visibility: visible;
			-webkit-animation: fadein 0.5s, fadeout 0.5s 5.5s;
			animation: fadein 0.5s, fadeout 0.5s 5.5s;
		}

		/* Animations to fade the snackbar in and out */
		@-webkit-keyframes fadein {
			from {top: 0; opacity: 0;}
			to {top: 80px; opacity: 1;}
		}

		@keyframes fadein {
			from {top: 0; opacity: 0;}
			to {top: 80px; opacity: 1;}
		}

		@-webkit-keyframes fadeout {
			from {top: 80px; opacity: 1;}
			to {top: 0; opacity: 0;}
		}

		@keyframes fadeout {
			from {top: 80px; opacity: 1;}
			to {top: 0; opacity: 0;}
		}
	`);

	document.body.appendChild(toast);
	return {style, toast};
};

const removeToast = (toast: HTMLDivElement, style: HTMLStyleElement) => {
	document.body.removeChild(toast);
	styleRemove(style);
};

const showToast = (text: string, toastType: ToastType) => {
	const {style, toast} = createToast(toastType);
	toast.innerText = text;
	setTimeout(() => removeToast(toast, style), TOAST_DURATION_MS);
};

window.addEventListener(SHOW_TOAST_EVENT, (event: CustomEvent<ShowToastEvent>) => {
	const {toastText, toastType} = event.detail;
	showToast(toastText, toastType);
});
