import {Range} from "../sheets";

type TagMapper = `${string}$TAG${string}`;
type TagSheetDescriptor = {range: Range; mapper: TagMapper; name: string; cwRange?: Range};

type RawTagSheet = TagSheetDescriptor & {values: WarnedTag[][]};

type TagRoot = RawTagSheet & {children: TagTree[]};

/**
 * A tag tree contains the properly cased tag at the root,
 * and a pointer to its parent in the tree
 */
type TagTree = {tag: string; parent: TagTree | TagRoot; warning: boolean; children: TagTree[]};

/**
 * TagNodes is a map of lowercase tag to the tag subtree at that tag
 * It contains every subtree of the complete tag tree
 */
type TagNodes = Map<string, TagTree>;

type Tags = {nodes: TagNodes; roots: TagRoot[]};

interface TagSearchOptions {
	noCache: boolean;
}

type WarnedTag = {tag: string; warning: boolean};

export {WarnedTag, TagTree, TagRoot, TagNodes, TagSearchOptions, RawTagSheet, TagSheetDescriptor, TagMapper, Tags};
