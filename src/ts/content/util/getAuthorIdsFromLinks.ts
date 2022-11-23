const getAuthorIdsFromLinks = (list: NodeListOf<HTMLLinkElement>) => {
	const links = Array.from(list);
	const paths = links.map((link) => new URL(link.href).pathname);
	const authorPaths = paths.filter((path) => path.startsWith("/author/"));
	return authorPaths.map((path) => path.split("/")[2]);
};

export {getAuthorIdsFromLinks};
