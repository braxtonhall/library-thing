import {BookRecord} from "./types";
import {getDocument} from "../../services/finder/util/getDocument";
import {scrapeCopy} from "./scrapeCopy";

const cache = new Map<string, BookRecord>();

const scrapeBook = async (id: string, link: string): Promise<BookRecord> => {
	try {
		return scrapeCopy(id, await getDocument(link));
	} catch (error) {
		console.error(error);
		// must always return something
		return {id, tags: [], authorIds: []};
	}
};

const _yield = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const pollForBook = async (id: string): Promise<BookRecord> => {
	const value = cache.get(id);
	if (value === null) {
		await _yield();
		return pollForBook(id);
	} else {
		return value;
	}
};

const getBook = async (link: string): Promise<BookRecord> => {
	const id = new URL(link).pathname.split("/").pop();
	if (!cache.has(id)) {
		cache.set(id, null); // Lock!
		const newValue = await scrapeBook(id, link);
		cache.set(id, newValue);
		return newValue;
	} else {
		return pollForBook(id);
	}
};

export {getBook};
