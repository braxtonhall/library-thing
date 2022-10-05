import {SHOW_TOAST_EVENT} from "../constants";
import {ToastType, ShowToastEvent} from "../types";

export const emitShowToast = (toastText: string, toastType: ToastType) => {
	const toastEvent = new CustomEvent<ShowToastEvent>(SHOW_TOAST_EVENT, {detail: {toastText, toastType}});
	window.dispatchEvent(toastEvent);
};
