interface Version {
	major: number;
	minor: number;
	revision: number;
}

const versionCompare = (comparator: (a: number, b: number) => boolean) => (versionA: Version, versionB: Version) => {
	if (comparator(versionA.major, versionB.major)) {
		return true;
	} else if (comparator(versionB.major, versionA.major)) {
		return false;
	} else if (comparator(versionA.minor, versionB.minor)) {
		return true;
	} else if (comparator(versionB.minor, versionA.minor)) {
		return false;
	} else if (comparator(versionA.revision, versionB.revision)) {
		return true;
	} else if (comparator(versionB.revision, versionA.revision)) {
		return false;
	} else {
		return false;
	}
};

const versionLessThan = versionCompare((a, b) => a < b);

const versionEquals = versionCompare((a, b) => a === b);

const toVersion = (tag: string): Version => {
	const [major, minor, revision] = tag.split(".").map(Number);
	return {major, minor, revision};
};

export type {Version};
export {toVersion, versionEquals, versionLessThan};
