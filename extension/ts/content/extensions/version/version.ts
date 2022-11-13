interface Version {
	major: number;
	minor: number;
	revision: number;
}

const versionLessThan = (versionA: Version, versionB: Version) => {
	const lessThan = (versionA: Version, versionB: Version, keys: (keyof Version)[]): boolean => {
		const [key, ...rest] = keys;
		if (key) {
			if (versionA[key] < versionB[key]) {
				return true;
			} else if (versionA[key] > versionB[key]) {
				return false;
			} else {
				return lessThan(versionA, versionB, rest);
			}
		} else {
			return false;
		}
	};
	return lessThan(versionA, versionB, ["major", "minor", "revision"]);
};

const versionEquals = (a: Version, b: Version) => ["major", "minor", "revision"].every((key) => a[key] === b[key]);

const toVersion = (tag: string): Version => {
	const [major, minor, revision] = tag.split(".").map(Number);
	return {major, minor, revision};
};

export type {Version};
export {toVersion, versionEquals, versionLessThan};
