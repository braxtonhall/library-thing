/**
 * A tag tree contains the properly cased tag at the root,
 * and a pointer to its parent in the tree
 */
type TagTree = {tag: string; parent?: TagTree};

/**
 * TagTrees is a map of lowercase tag to the tag subtree at that tag
 * It contains every subtree of the complete tag tree
 */
type TagTrees = Map<string, TagTree>;

interface TagSearchOptions {
	noCache: boolean;
}

type TagMapper = `${string}$TAG${string}`;

export {TagTree, TagTrees, TagMapper, TagSearchOptions};
