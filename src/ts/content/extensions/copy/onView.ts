import {saveFormData} from "./common";
import * as browser from "webextension-polyfill";
import {loaderOverlaid} from "../../../common/ui/loadingIndicator";
import {getDocument} from "../../services/finder/util/getDocument";
import {getFormData} from "../../entities/bookForm";

const handleClick = (href: string) => () =>
	loaderOverlaid(async () => {
		const document = await getDocument(href);
		await saveFormData(getFormData(document));
	});

const isLinkToEdit = (element: HTMLElement): element is HTMLAnchorElement =>
	"href" in element &&
	typeof element.href === "string" &&
	/\/work\/[0-9a-zA-Z]+\/edit\/[0-9a-zA-Z]+\/?$/.test(element.href);
const addCopyButton = (buttonHTML: string) => (element: HTMLElement) => {
	const editElement = Array.from(element.children).find(isLinkToEdit);
	if (editElement) {
		const link = document.createElement("a");
		link.href = "#";
		link.innerHTML = buttonHTML;
		link.addEventListener("click", handleClick(editElement.href));
		element.insertBefore(link, element.children[0]);
	}
};

const saveImage = browser.runtime.getURL("img/save.png");
const searchCopyImage = `<img src="${saveImage}" class="sp_c20" style="background-position: 0px -178px; " title="copy" alt="copy">`;
const workViewCopyImage = `<img src="${saveImage}" class="icon" style="filter: grayscale(0) brightness(5) contrast(0.1);" alt="edit book">`;
window.addEventListener("pageshow", () => {
	Array.from(document.querySelectorAll(".tools")).forEach(addCopyButton(searchCopyImage));
	const actionContainer = document.getElementById("ActionContainer");
	actionContainer && addCopyButton(workViewCopyImage)(actionContainer);
});
