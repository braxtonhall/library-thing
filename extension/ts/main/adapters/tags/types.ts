type TagNode = {tag: string; parent?: TagNode};
type TagTree = Map<string, TagNode>;

interface TagSearchOptions {
	noCache: boolean;
}

export {TagNode, TagTree, TagSearchOptions};
