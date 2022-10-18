/**
 * Used to enforce following invariants:
 * 1. that all author tags have the word "author" at the end
 * 2. that there are no duplicates
 * 3. tags have no excessive whitespace
 * Also? I HATE that this is all the way over in this file, and not embedded in the adapter!
 */
const filterAuthorTags = (tags: string[]) => {
	const authorTags = tags.filter((tag) => tag.toLowerCase().endsWith("author"));
	const trimmedTags = authorTags.map((tag) => tag.trim());
	return [...new Set(trimmedTags)];
};

export {filterAuthorTags};
