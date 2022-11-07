import "../../../sass/tooltip.sass";

import {UIColour} from "./colour";

enum TooltipPosition {
	TOP = "vbl-tool-tip-top",
	BOTTOM = "vbl-tool-tip-bottom",
	LEFT = "vbl-tool-tip-left",
	RIGHT = "vbl-tool-tip-right",
}

interface TooltipOptions {
	colour?: UIColour;
	position?: TooltipPosition;
	text: string;
}

const tooltipped = <T extends HTMLElement>(
	element: T,
	{text, colour = UIColour.GREY, position = TooltipPosition.TOP}: TooltipOptions
): T => {
	// This MiiIIIght not age well. Probably smarter to add an invisible anchor point inside element
	element.style.position = "relative";

	const span = document.createElement("span");
	span.innerText = text;

	const tooltip = document.createElement("div");
	tooltip.className = `vbl-tool-tip ${colour} ${position}`;
	tooltip.append(span);

	element.append(tooltip);
	return element;
};

export {TooltipOptions, TooltipPosition, tooltipped};
