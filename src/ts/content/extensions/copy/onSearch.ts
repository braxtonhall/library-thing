import * as browser from "webextension-polyfill";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {getDocument} from "../../services/finder/util/getDocument";
import {getFormData} from "../../entities/bookForm";
import {saveFormData} from "./common";

const buttonHTML = `<img src="${browser.runtime.getURL(
	"img/save.png"
)}" class="sp_c20" style="background-position: 0px -178px; " title="copy" alt="copy">`;

const getEditLink = (tools: HTMLElement): string => {
	const icons = Array.from(tools.querySelectorAll("img"));
	const editIcon = icons.find((icon) => icon.id.startsWith("editbookicon_"));
	if (editIcon && "href" in editIcon.parentElement) {
		return editIcon.parentElement.href as string;
	} else {
		throw new Error("This shouldn't possibly have happened!");
	}
};

const handleClick = (tools: HTMLElement) => () =>
	loaderOverlaid(async () => {
		const editLink = getEditLink(tools);
		const document = await getDocument(editLink);
		await saveFormData(getFormData(document));
	});

const addCopyButton = (element: HTMLElement) => {
	const link = document.createElement("a");
	link.href = "#";
	link.innerHTML = buttonHTML;
	link.addEventListener("click", handleClick(element));
	element.insertBefore(link, element.children[0]);
};

window.addEventListener("pageshow", () => Array.from(document.querySelectorAll(".tools")).forEach(addCopyButton));
