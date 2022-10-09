import {createFinderExtension} from "./util/finderExtension";
import {findSummary} from "../services/finder/summary/summaryFinder";

createFinderExtension<string>({
	buttonName: "Find Summary",
	finder: findSummary,
	onFail: () => "No summary found for this book",
	onSuccess: () => "Summary found!",
	isSuccess: (summary: string) => summary.length > 0,
	textAreaContainerId: "bookedit_summary",
	textAreaId: "form_summary",
	transform: (summary: string) => summary,
});
