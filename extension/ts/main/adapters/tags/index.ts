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

const getTagsIncluding = async (search: string, options: TagSearchOptions = {noCache: false}): Promise<string[]> => {
	const tags = await getAllTags(options);
	const lowerSearch = search.toLowerCase();
	const allTags = [...tags.values()];
	const matchingTags = allTags.filter((tag) => tag.toLowerCase().includes(lowerSearch));
	return matchingTags.sort();
};

export {getAncestry, getAllTags, getTagsIncluding};
