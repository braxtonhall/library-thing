import {LibGen} from "./impl/LibGen";
import {InternetArchive} from "./impl/InternetArchive";
import {Finder, FinderParameters} from "../finder";
import {commonFinder} from "../util/commonFinder";

type PdfFinderResponse = string[];

type PdfFinder = Finder<PdfFinderResponse>;

const finders: PdfFinder[] = [LibGen, InternetArchive];

const _findPdf = commonFinder(finders, []);

const findPdf: PdfFinder = (parameters: FinderParameters) =>
	_findPdf(parameters).then((result: string[][]) => result.flat());

export {PdfFinderResponse, PdfFinder, findPdf};
