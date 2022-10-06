export const styleInject = (cssText: string) => {
	const head = document.head || document.getElementsByTagName("head")[0];
	const style = document.createElement("style");
	style.appendChild(document.createTextNode(cssText));
	head.appendChild(style);
	return style;
};

export const styleRemove = (style: HTMLStyleElement) => {
	const head = document.head || document.getElementsByTagName("head")[0];
	head.removeChild(style);
};
