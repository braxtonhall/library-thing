import Sheets from "./sheets";
import {makeCache} from "../util/cache";

type TagNode = {tag: string; parent?: TagNode};
type TagTree = Map<string, TagNode>;

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin

const META_SHEET = "META";

interface ParserOptions {
	rows: string[][];
	fromRow: number;
	depth: number;
	tree: TagTree;
	parent?: TagNode;
}

interface ParserResponse {
	last: number;
}

const {asyncCached} = makeCache<TagTree>();

const getTagRanges = async (): Promise<string[]> => {
	const range = Sheets.createRange(META_SHEET, "A", "A");
	const response = await Sheets.readRanges(SPREADSHEET_ID, [range]);
	return response.valueRanges.flatMap((valueRange) => valueRange.values.map((value) => value[0]));
};

const recursiveParseRows = ({rows, fromRow, depth, tree, parent}: ParserOptions): ParserResponse => {
	let row = fromRow;
	while (row < rows.length) {
		const tag = rows[row][depth];
		if (tag) {
			const node = {tag, parent};
			tree.set(tag, node);
			const {last} = recursiveParseRows({rows, fromRow: row + 1, depth: depth + 1, tree, parent: node});
			row = last;
		} else {
			break;
		}
	}
	return {last: row};
};

const parseTree = (rows: string[][]) => {
	const tree: TagTree = new Map();
	let fromRow = 0;
	while (fromRow < rows.length) {
		const {last} = recursiveParseRows({rows, fromRow, depth: 0, tree});
		fromRow = last + 1;
	}
	return tree;
};

const getSheetsTags = async (): Promise<string[][]> => {
	const response = await Sheets.readRanges(SPREADSHEET_ID, await getTagRanges());
	return response.valueRanges.flatMap((valueRange) => valueRange.values);
};

const getTagTree = () => asyncCached("", async () => parseTree(await getSheetsTags()));

const getAncestry = async (tag: string): Promise<string[]> => {
	const tree = await getTagTree();
	const ancestry = [];
	for (let node = tree.get(tag); node; node = tree.get(node.parent?.tag)) {
		ancestry.push(node.tag);
	}
	return ancestry;
};

const isValidTag = async (tag: string): Promise<boolean> => (await getTagTree()).has(tag);

const getAllTags = async () => Array.from((await getTagTree()).values()).map((node) => node.tag);

const getTagsIncluding = async (search: string): Promise<string[]> => {
	const tags = await getAllTags();
	const lowerSearch = search.toLowerCase();
	return tags.filter((tag) => tag.toLowerCase().includes(lowerSearch));
};

export {getAncestry, getAllTags, isValidTag, getTagsIncluding};
