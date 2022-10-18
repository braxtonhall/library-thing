import {BookRecord} from "../types";
import {getDocument} from "../../../services/finder/util/getDocument";
import {scrapeCopy} from "./scrapeCopy";
import {asyncCached} from "../bookCache";

const getBook = async (link: string): Promise<BookRecord> => {
	const id = new URL(link).pathname.split("/").pop();

	return asyncCached(id, async () => {
		try {
			return scrapeCopy(id, await getDocument(link));
		} catch (error) {
			console.error(error);
			// must always return something
			return {id, tags: [], authorIds: []};
		}
	});
};

export {getBook};
