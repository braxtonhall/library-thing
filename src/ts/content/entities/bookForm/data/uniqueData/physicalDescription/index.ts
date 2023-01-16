import {FormData} from "../../../types";
import {uniqueFormElement} from "../uniqueFormElement";

const isPhysicalDescriptionElement =
	(ancestorId: string, name: string) =>
	(element: Element): boolean =>
		element.name === name && element.closest(".bookeditfield").id === ancestorId;

const calculateRow = (element: Element): number => {
	const fieldSet = element.closest("fieldset");
	const siblings = Array.from(fieldSet.parentElement.children);
	const rows = siblings.filter((sibling: HTMLElement) => sibling.style.display !== "none");
	return rows.findIndex((row) => row === fieldSet);
};

const fromPhysicalDescriptionElement = (key: string, name: string) => (formData: FormData, element) => {
	const row = calculateRow(element);
	console.log(row, element.value);
	if (row >= 0) {
		formData[key] ??= [];
		formData[key][row] ??= {};
		formData[key][row][name] ??= {};
		formData[key][row][name] = {value: element.value, checked: element.checked};
	}
};

const fromPhysicalDescriptionFormData = (key: string, name: string) => (formData: FormData, element) => {
	const row = calculateRow(element);
	return formData[key]?.[row]?.[name] ?? element;
};

const physicalDescriptionFormElement = (id: string) => (name: string) => {
	const key = `_vbl_${id}`;
	return uniqueFormElement({
		predicate: isPhysicalDescriptionElement(id, name),
		fromElement: fromPhysicalDescriptionElement(key, name),
		fromFormData: fromPhysicalDescriptionFormData(key, name),
	});
};

const paginationFormElement = physicalDescriptionFormElement("bookedit_pages");
const pageCount = paginationFormElement("pagecount");
const pageType = paginationFormElement("pagetype");

const dimensionFormElement = physicalDescriptionFormElement("bookedit_phys_dims");
const height = dimensionFormElement("height");
const length = dimensionFormElement("length_dim");
const thickness = dimensionFormElement("thickness");
const dimensionsUnit = dimensionFormElement("d-unit");

const weightFormElement = physicalDescriptionFormElement("bookedit_weights");
const weight = weightFormElement("weight");
const weightUnit = weightFormElement("unit");

const physicalDescription = [
	pageCount,
	pageType,
	height,
	length,
	thickness,
	dimensionsUnit,
	weight,
	weightUnit,
] as const;

export {physicalDescription};
