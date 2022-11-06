import Sheets from "./sheets";
import {makeCache} from "../util/cache";

type TagNode = {tag: string; parent?: TagNode};
type TagTree = Map<string, TagNode>;

declare const SPREADSHEET_ID: string; // Declared in webpack DefinePlugin

const META_TAG_SHEET = "Tag Index Index";

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

const incrementColumn = (column: string): string => {
	const parts = column.split("");
	const incParts = (parts: string[]): string[] => {
		if (parts.length === 0) {
			return ["A"];
		} else {
			const last = parts.pop();
			if (last === "Z") {
				return [...incParts(parts), "A"];
			} else {
				return [...parts, String.fromCharCode(last.charCodeAt(0) + 1)];
			}
		}
	};
	return incParts(parts).join();
};

const incrementColumnBy = (column: string, n: number): string => {
	if (n <= 0) {
		return column;
	} else {
		return incrementColumnBy(incrementColumn(column), n - 1);
	}
};

const rowIsRange = ([, topLeft, width]: string[]): boolean =>
	topLeft && width && /^[A-Z]+[0-9]+$/.test(topLeft) && /^[0-9]+$/.test(width);

const rowToRange = ([sheet, topLeft, width]: string[]): string => {
	const left = topLeft.match(/^[A-Z]+/)[0];
	const right = incrementColumnBy(left, Number(width) - 1);
	return `${sheet}!${topLeft}:${right}`;
};

const getTagRanges = async (): Promise<string[]> => {
	const range = Sheets.createRange(META_TAG_SHEET, "A", "C");
	const response = await Sheets.readRanges(SPREADSHEET_ID, [range]);
	return response.valueRanges?.[0].values.filter(rowIsRange).map(rowToRange) ?? [];
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
	const ranges = await getTagRanges();
	const response = await Sheets.readRanges(SPREADSHEET_ID, ranges);
	return response.valueRanges.flatMap((valueRange) => valueRange.values ?? []);
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
