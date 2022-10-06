import {styleInject, styleRemove} from "./util";

const TOAST_ON_SCREEN_MS = 2000;
const TOAST_TRANSITION_MS = 500;
let toastCounter = 0;

enum ToastType {
	ERROR,
	WARNING,
	SUCCESS,
}

const backgroundColours: { [type in ToastType]: `#${string}` } = {
	[ToastType.ERROR]: "#FF6955",
	[ToastType.WARNING]: "#FFB82F",
	[ToastType.SUCCESS]: "#A0FF98",
};

const getToastBackgroundColour = (toastType: ToastType) =>
	backgroundColours[toastType] ?? `#FFFFFF`;

const onScreen: Keyframe = {top: '80px', opacity: 1};
const offScreen: Keyframe = {top: 0, opacity: 0};

const fadeIn: Keyframe[] = [offScreen, onScreen];
const fadeOut: Keyframe[] = [onScreen, offScreen];

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
		}
	`);

	document.body.appendChild(toast);
	toast.animate(fadeIn, TOAST_TRANSITION_MS);
	return {style, toast};
};

const removeToast = (toast: HTMLDivElement, style: HTMLStyleElement) => {
	toast.animate(fadeOut, TOAST_TRANSITION_MS);
	setTimeout(() => {
		document.body.removeChild(toast);
		styleRemove(style);
	}, TOAST_TRANSITION_MS);
};

const showToast = (text: string, toastType: ToastType) => {
	const {style, toast} = createToast(toastType);
	toast.innerText = text;
	setTimeout(() => removeToast(toast, style), TOAST_ON_SCREEN_MS);
};

export {showToast, ToastType};
