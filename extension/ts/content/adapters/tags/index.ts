import {TagSearchOptions} from "./types";
import {getTagTree} from "./getTags";

const getAncestry = async (tag: string): Promise<string[]> => {
	const tree = await getTagTree();
	const ancestry = [];
	for (let node = tree.get(tag); node; node = node.parent) {
		ancestry.push(node.tag);
	}
	return ancestry;
};

const getAllTags = async (options: TagSearchOptions = {noCache: false}) => {
	const nodes = (await getTagTree(options)).values();
	const tags = [...nodes].map((node) => node.tag);
	return new Set(tags);
};

const tagMatches = (search: string, match: RegExp) => (tag) =>
	tag.length > search.length && tag.toLowerCase().includes(search) && match.test(tag);

const getTagsIncluding = async (
	search: string,
	{noCache = false, match = /.*/}: {noCache?: boolean; match?: RegExp} = {}
): Promise<string[]> => {
	const tags = await getAllTags({noCache});
	const lowerSearch = search.toLowerCase();
	const allTags = [...tags.values()];
	const matchingTags = allTags.filter(tagMatches(lowerSearch, match));
	return matchingTags.sort();
};

export {getAncestry, getAllTags, getTagsIncluding};
