import {Finder, FinderParameters} from "../finder";
import {goodreads} from "./impl/Goodreads";
import {amazon} from "./impl/Amazon";

type SummaryFinderResponse = string;

type SummaryFinder = Finder<SummaryFinderResponse>;

const finders: SummaryFinder[] = [goodreads, amazon];

const findSummary = async (parameters: FinderParameters): Promise<SummaryFinderResponse[]> =>
	Promise.all(
		finders.map((finder: SummaryFinder) =>
			finder(parameters).catch((error) => {
				console.error(error);
				return "";
			})
		)
	);

export {SummaryFinderResponse, SummaryFinder, findSummary};
