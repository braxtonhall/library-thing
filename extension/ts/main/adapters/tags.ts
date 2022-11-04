import Sheets from "./sheets";
import {makeCache} from "../util/cache";

type TagNode = {tag: string; parent?: TagNode};
type TagTree = Map<string, TagNode>;

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin

const META_SHEET = "META";

interface TagSearchOptions {
	noCache: boolean;
}

interface ParserOptions {
	rows: string[][];
	fromRow: number;
	depth: number;
	tree: TagTree;
	parent?: TagNode;
}

const {asyncCached, setCache} = makeCache<TagTree>();

const getTagRanges = async (): Promise<string[]> => {
	const range = Sheets.createRange(META_SHEET, "A", "A");
	const response = await Sheets.readRanges(SPREADSHEET_ID, [range]);
	return response.valueRanges.flatMap((valueRange) => valueRange.values.map((value) => value[0]));
};

const parseRows = ({rows, fromRow, depth, tree, parent}: ParserOptions): number => {
	let row = fromRow;
	while (row < rows.length) {
		const tag = rows[row][depth];
		if (tag) {
			const node = {tag, parent};
			tree.set(tag, node);
			row = parseRows({rows, fromRow: row + 1, depth: depth + 1, tree, parent: node});
		} else {
			break;
		}
	}
	return row;
};

const parseTree = (rows: string[][]) => {
	const tree: TagTree = new Map();
	for (let fromRow = 0; fromRow < rows.length; fromRow = parseRows({rows, fromRow, depth: 0, tree}) + 1);
	return tree;
};

const getSheetsTags = async (): Promise<string[][]> => {
	const response = await Sheets.readRanges(SPREADSHEET_ID, await getTagRanges());
	return response.valueRanges.flatMap((valueRange) => valueRange.values);
};

const getTagTree = async ({noCache}: TagSearchOptions = {noCache: false}) => {
	const implementation = async () => parseTree(await getSheetsTags());
	if (noCache) {
		return implementation().then((tree) => setCache("", tree));
	} else {
		return asyncCached("", implementation);
	}
};

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
	return [...tags.values()].filter((tag) => tag.toLowerCase().includes(lowerSearch));
};

export {getAncestry, getAllTags, getTagsIncluding};
