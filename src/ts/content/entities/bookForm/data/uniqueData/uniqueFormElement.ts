import {match} from "../../../../../common/util/match";
import {FormData} from "../../types";

type Predicate = (element) => boolean;
type FromFormData = (formData: FormData, element) => {value: string; checked: boolean};
type FromFormDataStrict = (formData: FormData, element) => {value: string; checked: boolean} | false;
type FromElement = (formData: FormData, element) => {value: string; checked: boolean};

interface UniqueFormElementDescriptor {
	isFormData: () => readonly [Predicate, () => true];
	fromFormData: (formData: FormData) => readonly [Predicate, (element) => {value: string; checked: boolean}];
	fromElement: (formData: FormData) => readonly [Predicate, (element) => void];
	fromFormDataStrict: (
		formData: FormData
	) => readonly [Predicate, (element) => {value: string; checked: boolean} | false];
}

interface UniqueFormElementOptions {
	predicate: Predicate;
	fromFormData: FromFormData;
	fromElement: FromElement;
	fromFormDataStrict: FromFormDataStrict;
}

const uniqueFormElement = ({
	predicate,
	fromElement,
	fromFormData,
	fromFormDataStrict,
}: UniqueFormElementOptions): UniqueFormElementDescriptor => ({
	isFormData: () => [predicate, () => true] as const,
	fromFormData: (formData: FormData) => [predicate, (element) => fromFormData(formData, element)] as const,
	fromElement: (formData: FormData) => [predicate, (element) => fromElement(formData, element)] as const,
	fromFormDataStrict: (formData: FormData) =>
		[predicate, (element) => fromFormDataStrict(formData, element)] as const,
});

const matchFactoryFromDescriptors =
	(...descriptors: UniqueFormElementDescriptor[]) =>
	<T>(
		kind: Exclude<keyof UniqueFormElementDescriptor, "predicate">,
		otherwise: (formData: FormData, element: Element) => T
	) =>
	(formData: FormData, element: Element) =>
		descriptors
			.reduce((acc, descriptor) => acc.case(...descriptor[kind](formData)), match(element))
			.default(() => otherwise(formData, element));

export {uniqueFormElement, matchFactoryFromDescriptors};
