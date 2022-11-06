/**
 * Used to move one column to the right in a spreadsheet
 * For example: A ->  B
 *              B ->  Z
 *              Z -> AA
 * @param column - string matching the regex [A-Z]*
 */
const incrementColumn = (column: string): string => {
	const parts = column.split("");
	const incParts = (parts: string[]): string[] => {
		if (parts.length === 0) {
			return ["A"];
		} else {
			const last = parts.pop();
			if (last === "Z") {
				return [...incParts(parts), "A"];
			} else {
				return [...parts, String.fromCharCode(last.charCodeAt(0) + 1)];
			}
		}
	};
	return incParts(parts).join("");
};

const incrementColumnBy = (column: string, n: number): string => {
	// TODO might be nice to actually work on negative columns, up to empty string (in which case underflow error)
	if (n <= 0) {
		return column;
	} else {
		return incrementColumnBy(incrementColumn(column), n - 1);
	}
};

export {incrementColumnBy};
