import "../../../sass/tooltip.sass";

import {UIColour} from "./colour";

enum TooltipPosition {
	TOP = "vbl-tool-tip-top",
	BOTTOM = "vbl-tool-tip-bottom",
	LEFT = "vbl-tool-tip-left",
	RIGHT = "vbl-tool-tip-right",
}

interface TooltipOptions {
	colour: UIColour; // Move Modal colour out, and apply it to loader as well
	position?: TooltipPosition; // Defaults to TOP
	text: string;
}

const tooltipped = <T extends HTMLElement>(
	element: T,
	{colour, text, position = TooltipPosition.TOP}: TooltipOptions
): T => {
	// This MiiIIIght not age well. Probably smarter to add an invisible anchor point inside element
	element.style.position = "relative";
	const tooltip = document.createElement("span");
	tooltip.className = `vbl-tool-tip ${colour} ${position}`;
	tooltip.innerText = text;
	element.append(tooltip);
	return element;
};

export {TooltipOptions, TooltipPosition, tooltipped};
