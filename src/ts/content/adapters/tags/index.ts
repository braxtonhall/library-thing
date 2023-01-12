import {TagSearchOptions, TagNodes, TagTree} from "./types";
import {getTagTrees} from "./getTags";

const getAncestry = async (tag: string): Promise<string[]> => {
	const {nodes} = await getTagTrees();
	const ancestry = [];
	for (let node: TagTree["parent"] = nodes.get(tag.toLowerCase()); node && "parent" in node; node = node.parent) {
		// TODO maybe we should detect collisions here and then create a modal?
		"tag" in node && ancestry.push(node.tag);
	}
	return ancestry;
};

const getTagList = async (options: TagSearchOptions = {noCache: false}) => {
	const nodes = (await getTagTrees(options)).nodes.values();
	const tags = [...nodes].map((node) => node.tag);
	return new Set(tags);
};

const tagMatches = (search: string, match: RegExp) => (tag: string) =>
	tag.length > search.length && tag.toLowerCase().includes(search) && match.test(tag);

const getTagsIncluding = async (
	search: string,
	{noCache = false, match = /.*/}: {noCache?: boolean; match?: RegExp} = {}
): Promise<string[]> => {
	const tags = await getTagList({noCache});
	const lowerSearch = search.toLowerCase();
	const allTags = [...tags.values()];
	const matchingTags = allTags.filter(tagMatches(lowerSearch, match));
	return matchingTags.sort();
};

const getTagsFromElement = (element: HTMLTextAreaElement | HTMLInputElement): string[] =>
	element?.value
		?.split(",")
		.map((tag) => tag.trim())
		.filter((tag) => !!tag) ?? [];

export type {TagNodes};
export {getAncestry, getTagList, getTagsIncluding, getTagTrees, getTagsFromElement};
