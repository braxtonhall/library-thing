import {findPdf} from "../services/finder/pdf/pdfFinder";
import {createFinderExtension} from "./util/finderExtension";

createFinderExtension<string[]>({
	id: "find-pdf",
	buttonName: "Find PDF",
	finder: findPdf,
	onFail: () => "No PDFs found for this book",
	onSuccess: (links: string[]) => `Found ${links.length} PDF${links.length > 1 ? "s" : ""}!`,
	isSuccess: (links: string[]) => links.length > 0,
	textAreaContainerId: "bookedit_comments",
	textAreaId: "form_comments",
	transform: (links: string[]) => links.map((link) => `PDF: ${link}`).join("\n"),
	delimiter: "\n",
});
