import {TagNode, TagTree} from "./types";

interface ParserOptions {
	rows: string[][];
	fromRow: number;
	depth: number;
	tree: TagTree;
	parent?: TagNode;
}

const parseRows = ({rows, fromRow, depth, tree, parent}: ParserOptions): number => {
	let row = fromRow;
	while (row < rows.length) {
		const tag = rows[row][depth];
		if (tag) {
			const node = {tag, parent};
			tree.set(tag.toLowerCase(), node);
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

export {parseTree};
