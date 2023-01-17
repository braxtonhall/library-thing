/**
 * This is how specific elements should be transformed as a paste operation occurs
 * Indexed using the element ID on librarything.com
 */
type Transformer<T> = (incoming: T, existing: T) => T;
const checkedTransformers: {[elementId: string]: Transformer<boolean>} = {};
const valueTransformers: {[elementId: string]: Transformer<string>} = {
	item_inventory_barcode_1: (incoming, existing) => existing,
	form_comments: (incoming, existing) => {
		if (existing === incoming) {
			// Don't remove existing data on an accidental paste
			return existing;
		} else {
			return incoming
				.split("\n")
				.filter((line) => !/^\s*LOCATION:.+/i.test(line))
				.join("\n");
		}
	},
};

const transformIncomingData = (incoming: any, existing: any) => {
	const transformedValue = valueTransformers[existing.id]?.(incoming.value, existing.value) ?? incoming.value;
	const transformedChecked =
		checkedTransformers[existing.id]?.(incoming.checked, existing.checked) ?? incoming.checked;
	return {value: transformedValue, checked: transformedChecked};
};

export {transformIncomingData};
