import {match} from "../../../../../common/util/match";
import {FormData} from "../../types";

type Predicate = (element) => boolean;
type FromFormData = (formData: FormData, element) => {value: string; checked: boolean};
type FromElement = (formData: FormData, element) => void;

interface UniqueFormElementDescriptor {
	predicate: Predicate;
	isFormData: () => readonly [Predicate, () => true];
	fromFormData: (formData: FormData) => readonly [Predicate, (element) => {value: string; checked: boolean}];
	fromElement: (formData: FormData) => readonly [Predicate, (element) => void];
}

interface UniqueFormElementOptions {
	predicate: Predicate;
	fromFormData: FromFormData;
	fromElement: FromElement;
}

const uniqueFormElement = ({
	predicate,
	fromElement,
	fromFormData,
}: UniqueFormElementOptions): UniqueFormElementDescriptor => ({
	predicate,
	isFormData: () => [predicate, () => true] as const,
	fromFormData: (formData: FormData) => [predicate, (element) => fromFormData(formData, element)] as const,
	fromElement: (formData: FormData) => [predicate, (element) => fromElement(formData, element)] as const,
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
			.default(() => otherwise(formData, element))
			.yield();

export {uniqueFormElement, matchFactoryFromDescriptors};
