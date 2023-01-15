import {FormData} from "../types";

type Predicate = (element) => boolean;
type FromFormData = (formData: FormData, element) => Record<string, any>;
type FromElement = (formData: FormData, element) => void;

interface UniqueFormElementOptions {
	predicate: Predicate;
	fromFormData: FromFormData;
	fromElement: FromElement;
}

const uniqueFormElement = ({predicate, fromElement, fromFormData}: UniqueFormElementOptions) => ({
	predicate,
	fromFormData: (formData: FormData) => [predicate, (element) => fromFormData(formData, element)] as const,
	fromElement: (formData: FormData) => [predicate, (element) => fromElement(formData, element)] as const,
});

export {uniqueFormElement};
