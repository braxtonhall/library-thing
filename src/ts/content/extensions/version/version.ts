interface Version {
	major: number;
	minor: number;
	revision: number;
}

const versionLT = (versionA: Version, versionB: Version) => {
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

const versionEQ = (a: Version, b: Version) => ["major", "minor", "revision"].every((key) => a[key] === b[key]);

const versionLTE = (a: Version, b: Version) => versionLT(a, b) || versionEQ(a, b);
const versionGT = (a: Version, b: Version) => !versionLTE(a, b);
const versionGTE = (a: Version, b: Version) => !versionLT(a, b);
const versionNEQ = (a: Version, b: Version) => !versionEQ(a, b);

const toVersion = (tag: string): Version => {
	const [major, minor, revision] = tag.split(".").map(Number);
	return {major, minor, revision};
};

export type {Version};
export {toVersion, versionEQ, versionLT, versionLTE, versionGT, versionGTE, versionNEQ};
