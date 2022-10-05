export enum ToastType {
	WARNING,
	SUCCESS,
}

function styleInject(cssText: string) {
	const head = document.head || document.getElementsByTagName("head")[0];
	const style = document.createElement("style");
	style.appendChild(document.createTextNode(cssText));
	head.appendChild(style);
	return style;
}

const createToast = (toastType: ToastType) => {
	const toast = document.createElement("div");
	toast.id = `better-library-thing-toast-${Math.floor(Math.random() * 100)}`;
	const style = styleInject(`
		#${toast.id} {
			min-width: 400px; /* Set a default minimum width */
			margin-left: -200px; /* Divide value of min-width by 2 */
			text-align: center;
			font-weight: bold;
			border-radius: 8px; /* Rounded borders */
			padding: 16px;
			position: fixed;
			z-index: 99;
			left: 70%;
			top: 80px;
			color: #000;
			background-color: ${toastType == ToastType.WARNING ? "#FFB82F" : "#A0FF98"};
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

export const showToast = (text: string, toastType: ToastType) => {
	const {style, toast} = createToast(toastType);
	toast.innerText = text;
	setTimeout(() => {
		const head = document.head || document.getElementsByTagName("head")[0];
		document.body.removeChild(toast);
		head.removeChild(style);
	}, 6000);
};
