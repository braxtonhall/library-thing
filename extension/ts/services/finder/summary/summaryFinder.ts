
import {Finder, FinderParameters} from "../finder";

type SummaryFinderResponse = string;

type SummaryFinder = Finder<SummaryFinderResponse>;

const finders: SummaryFinder[] = [

];

const findSummary: SummaryFinder = async (parameters: FinderParameters): Promise<SummaryFinderResponse> =>
	Promise.race(finders.map((finder: SummaryFinder) => finder(parameters)));

export {SummaryFinderResponse, SummaryFinder, findSummary};
