import {createButton} from "../ui/button";
import {getDocument} from "../services/finder/util/getDocument";

const SEARCH_URL = "https://www.librarything.com/catalog_bottom.php";

const getUUID = () => {
	const [, , uuid] = window.location.pathname.split("/");
	return uuid;
};

const getBookListURL = (uuid: string) => {
	const url = new URL(SEARCH_URL);
	url.search = new URLSearchParams({author: uuid}).toString();
	return url.toString();
};

const getBookLinks = async () => {
	const document = await getDocument(getBookListURL(getUUID()));
	const links = document.querySelectorAll<HTMLLinkElement>("#lt_catalog_list > tbody > tr > td > a.lt-title");
	return Array.from(links).map((link) => link.href);
};

window.addEventListener("load", () => {
	if (document.querySelector("body.authorpage")) {
		const container = document.querySelector("table.authorContentTable td.middle");
		const button = createButton("CLICK", "img/search.png", async () => {
			console.log(await getBookLinks());
		});
		container.insertBefore(button, container.children[2]);
		console.log(container);
	}
});
