const parser = new DOMParser();

const parseHtml = (html: string): HTMLBodyElement =>
	parser.parseFromString(html, "text/html").getElementsByTagName("body")[0];

export {parseHtml};
