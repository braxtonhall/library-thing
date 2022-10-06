const TOAST_ON_SCREEN_MS = 6000;
const TOAST_TRANSITION_MS = 500;
const TRANSITION_CLASS_NAME = "transitioning";
const CLICKABLE_CLASS_NAME = "ready";
const TOAST_CLASS_NAME = "vblblt-toast";

enum ToastType {
	ERROR = "error-toast",
	WARNING = "warning-toast",
	SUCCESS = "success-toast",
}

const onScreen: Keyframe = {top: '80px', opacity: 1};
const offScreen: Keyframe = {top: 0, opacity: 0};

const fadeIn: Keyframe[] = [offScreen, onScreen];
const fadeOut: Keyframe[] = [onScreen, offScreen];

const createToast = (toastType: ToastType) => {
	const toast = document.createElement("div");
	toast.className = `${TOAST_CLASS_NAME} ${toastType}`;
	document.body.appendChild(toast);
	return toast;
};

const show = (toast: HTMLDivElement, onReady: (toast: HTMLDivElement) => void) => {
	const animation = toast.animate(fadeIn, TOAST_TRANSITION_MS);
	animation.onfinish = () => {
		toast.className = toast.className.replace(TRANSITION_CLASS_NAME, CLICKABLE_CLASS_NAME);
		onReady(toast);
	};
};

const removeToast = (toast: HTMLDivElement) => {
	toast.className = toast.className.replace(CLICKABLE_CLASS_NAME, TRANSITION_CLASS_NAME);
	toast.animate(fadeOut, TOAST_TRANSITION_MS).onfinish = () => {
		document.body.removeChild(toast);
	};
};

const prepareToDismiss = (toast: HTMLDivElement) => {
	const dismiss = () => {
		toast.removeEventListener("click", onClick);
		removeToast(toast);
	};
	const timeout = setTimeout(dismiss, TOAST_ON_SCREEN_MS);
	const onClick = () => {
		clearTimeout(timeout);
		dismiss();
	};
	toast.addEventListener("click", onClick);
};

const showToast = (text: string, toastType: ToastType) => {
	const toast = createToast(toastType);
	toast.innerText = text;
	show(toast, prepareToDismiss);
};

export {showToast, ToastType};
