import {FormData} from "../../types";
import {uniqueFormElement} from "./uniqueFormElement";

const isPhysicalDescriptionElement =
	(ancestorId: string, name: string) =>
	(element: Element): boolean =>
		element.name === name && element.closest(".bookeditfield").id === ancestorId;

const fromPhysicalDescriptionElement = (key: string, name: string) => (formData: FormData, element) => {
	const physicalDescription = formData[key] ?? [];
	const row = 0; // TODO
	physicalDescription[row] ??= {};
	physicalDescription[row][name] ??= {};
	physicalDescription[row][name] = {value: element.value, checked: element.checked};
	formData[key] = physicalDescription;
};

const fromPhysicalDescriptionFormData = (key: string, name: string) => (formData: FormData, element) => {
	const row = 0; // TODO
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
