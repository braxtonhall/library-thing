const cookies = (): Record<string, string> => {
	const entries = document.cookie.split(";").map((entry) => entry.trim());
	return Object.fromEntries(entries.map((entry) => entry.split("=")));
};

const get = (name: string): string => cookies()[name] ?? "";

export default {get};
