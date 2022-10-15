import {SummaryFinder, SummaryFinderResponse} from "../summaryFinder";
import {getDocument} from "../../util/getDocument";

const amazon: SummaryFinder = async (): Promise<SummaryFinderResponse> => {
	const link = document.querySelector("#buyborrowswapbox a[blurb]");
	const url = link?.getAttribute("blurb");
	if (url) {
		const description = (await getDocument(url)).querySelector("#bookDescription_feature_div .a-expander-content");
		return description?.textContent.trim() ?? "";
	}
	return "";
};

export {amazon};
