import {LibGen} from "./impl/LibGen";
import {InternetArchive} from "./impl/InternetArchive";
import {Finder, FinderParameters} from "../finder";

type PdfFinderResponse = string[];

type PdfFinder = Finder<PdfFinderResponse>;

const finders: PdfFinder[] = [LibGen, InternetArchive];

const findPdf: PdfFinder = async (parameters: FinderParameters): Promise<PdfFinderResponse> =>
	Promise.all(
		finders.map((finder: PdfFinder) =>
			finder(parameters).catch((error) => {
				console.error(error);
				return [];
			})
		)
	).then((result: string[][]) => result.flat());

export {PdfFinderResponse, PdfFinder, findPdf};
