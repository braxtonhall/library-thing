import {TagTree, TagNodes, WarnedTag, RawTagSheet, TagRoot} from "./types";

interface ParserOptions {
	rows: WarnedTag[][];
	fromRow: number;
	depth: number;
	nodes: TagNodes;
	parent: TagTree | TagRoot;
}

const parseRows = ({rows, fromRow, depth, nodes, parent}: ParserOptions): number => {
	let row = fromRow;
	while (row < rows.length) {
		const {tag, warning} = rows[row][depth] ?? {};
		if (tag) {
			const trimmedTag = tag.trim();
			const node = {name: trimmedTag, parent, warning, children: [], height: parent.height - 1};
			parent.children.push(node);
			// TODO if nodes already contains this tag, we need to emit a warning somehow!!! see #214
			// Keys in the tag nodes map are lowercase for ez lookup later
			nodes.set(trimmedTag.toLowerCase(), node);
			row = parseRows({rows, fromRow: row + 1, depth: depth + 1, nodes, parent: node});
		} else {
			break;
		}
	}
	return row;
};

const parseTags = (sheets: RawTagSheet[]) => {
	const nodes: TagNodes = new Map();
	const roots = sheets.map((sheet) => {
		const {values: rows, ...rest} = sheet;
		const parent: TagRoot = {...rest, children: []};
		for (let fromRow = 0; fromRow < rows.length; fromRow = parseRows({rows, fromRow, depth: 0, nodes, parent}) + 1);
		return parent;
	});
	return {nodes, roots};
};

export {parseTags};
