import {FormMetaDataDecorator} from "../../../types";
import {range} from "../../../../../../common/util/range";
import {weight} from "./elements/weight";
import {parseHtml} from "../../../../../../common/util/parseHtml";
import {pagination} from "./elements/pagination";
import {dimensions} from "./elements/dimensions";

const PAGINATION_INPUT_COUNT_ID = "bookedit_pages";
const DIMENSIONS_INPUT_COUNT_ID = "bookedit_phys_dims";
const WEIGHT_INPUT_COUNT_ID = "bookedit_weights";

const toKey = (id: string) => `__${id}`;

const isPhysicalDescriptionRow = (element: HTMLElement) =>
	element.tagName.toLowerCase() === "fieldset" && element.style.display !== "none";

const getPhysicalDescriptionInputCount = (fieldId: string, document: Document) => {
	const rows = Array.from(document.getElementById(fieldId).children);
	return rows.filter(isPhysicalDescriptionRow).length;
};

const addDescriptionCountsToMetaData: FormMetaDataDecorator = (
	document: Document,
	formMetaData: Record<string, unknown>
) => ({
	...formMetaData,
	[toKey(PAGINATION_INPUT_COUNT_ID)]: getPhysicalDescriptionInputCount(PAGINATION_INPUT_COUNT_ID, document),
	[toKey(DIMENSIONS_INPUT_COUNT_ID)]: getPhysicalDescriptionInputCount(DIMENSIONS_INPUT_COUNT_ID, document),
	[toKey(WEIGHT_INPUT_COUNT_ID)]: getPhysicalDescriptionInputCount(WEIGHT_INPUT_COUNT_ID, document),
});

const htmlGenerators: Record<string, (n: number, showSubtract: boolean, showAdd: boolean) => string> = {
	[PAGINATION_INPUT_COUNT_ID]: pagination,
	[DIMENSIONS_INPUT_COUNT_ID]: dimensions,
	[WEIGHT_INPUT_COUNT_ID]: weight,
};

const ensurePhysicalDescriptionInputCount = (fieldId: string, formMetaData: Record<string, unknown>) => {
	const expectedCount = Number(formMetaData[toKey(fieldId)] ?? 0);
	const currentCount = getPhysicalDescriptionInputCount(fieldId, document);
	const countToAdd = expectedCount - currentCount;
	const parent = document.getElementById(fieldId);
	if (parent && countToAdd > 0) {
		const childrenCount = parent.children.length;
		const htmlGenerator = htmlGenerators[fieldId];
		const html = range(0, countToAdd)
			.map((n) => htmlGenerator(childrenCount + n, expectedCount > 0, n === countToAdd - 1))
			.join("");
		const body = parseHtml(html);
		parent.append(...Array.from(body.children));
	}
};

const ensurePhysicalDescriptionInputCounts = (formMetaData: Record<string, unknown>) => {
	ensurePhysicalDescriptionInputCount(PAGINATION_INPUT_COUNT_ID, formMetaData);
	ensurePhysicalDescriptionInputCount(DIMENSIONS_INPUT_COUNT_ID, formMetaData);
	ensurePhysicalDescriptionInputCount(WEIGHT_INPUT_COUNT_ID, formMetaData);
};

export {isPhysicalDescriptionRow, addDescriptionCountsToMetaData, ensurePhysicalDescriptionInputCounts};
