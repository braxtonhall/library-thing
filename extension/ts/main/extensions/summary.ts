import {createFinderExtension} from "./util/finderExtension";
import {findSummary} from "../services/finder/summary/summaryFinder";

createFinderExtension<string[]>({
	id: "find-summary",
	buttonName: "Find Summary",
	finder: findSummary,
	onFail: () => "No summary found for this book",
	onSuccess: () => "Summary found!",
	isSuccess: (summaries: string[]) => summaries.some((summary) => summary.length > 0),
	textAreaContainerId: "bookedit_summary",
	textAreaId: "form_summary",
	transform: (summaries: string[]) =>
		summaries
			.filter((summary) => !!summary)
			.map((summary) => `SUMMARY: ${summary}`)
			.join("\n\n"),
	delimiter: "\n\n",
});
