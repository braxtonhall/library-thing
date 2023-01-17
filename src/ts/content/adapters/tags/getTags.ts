import {makeCache} from "../../../common/util/cache";
import {TagSearchOptions, Tags} from "./types";
import {parseTags} from "./parseTags";
import {getSheetsTags} from "./getTagSheets";

const {asyncCached, setCache} = makeCache<Tags>();

const getTagTrees = async ({noCache}: TagSearchOptions = {noCache: false}) => {
	const implementation = async () => parseTags(await getSheetsTags());
	if (noCache) {
		return implementation().then((tree) => setCache("", tree));
	} else {
		return asyncCached("", implementation);
	}
};

export {getTagTrees};
