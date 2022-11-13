import {TagTree, TagTrees} from "./types";

interface ParserOptions {
	rows: string[][];
	fromRow: number;
	depth: number;
	trees: TagTrees;
	parent?: TagTree;
}

const parseRows = ({rows, fromRow, depth, trees, parent}: ParserOptions): number => {
	let row = fromRow;
	while (row < rows.length) {
		const tag = rows[row][depth];
		if (tag) {
			const node = {tag, parent};
			// Keys in the tag trees map are lowercase for ez lookup later
			trees.set(tag.toLowerCase(), node);
			row = parseRows({rows, fromRow: row + 1, depth: depth + 1, trees, parent: node});
		} else {
			break;
		}
	}
	return row;
};

const parseTree = (rows: string[][]) => {
	const trees: TagTrees = new Map();
	for (let fromRow = 0; fromRow < rows.length; fromRow = parseRows({rows, fromRow, depth: 0, trees}) + 1);
	return trees;
};

export {parseTree};
