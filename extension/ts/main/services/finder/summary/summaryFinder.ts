import {Finder, FinderParameters} from "../finder";
import {goodreads} from "./impl/Goodreads";
import {amazon} from "./impl/Amazon";
import {commonFinder} from "../util/commonFinder";

type SummaryFinderResponse = string;

type SummaryFinder = Finder<SummaryFinderResponse>;

const finders: SummaryFinder[] = [goodreads, amazon];

const findSummary = commonFinder(finders, "");

export {SummaryFinderResponse, SummaryFinder, findSummary};
