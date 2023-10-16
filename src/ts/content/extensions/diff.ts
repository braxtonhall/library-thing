import "../../../sass/diff.sass";
import {FormData, onFormRender} from "../entities/bookForm";
import {FormAreaElement} from "../entities/bookForm/types";
import {getFormDataForElement, getFormDataFromElement} from "../entities/bookForm/data";

const makeOnChange = (formAreaElement: FormAreaElement, getCleanFormData: () => FormData) => {
	const savedData = getFormDataForElement(getCleanFormData(), formAreaElement);
	return () => {
		const {value: afterValue, checked: afterChecked} = getFormDataFromElement(formAreaElement);
		if (savedData === false || savedData.checked !== afterChecked || savedData.value !== afterValue) {
			formAreaElement.classList.add("vbl-dirty");
		} else {
			formAreaElement.classList.remove("vbl-dirty");
		}
	};
};

const addDiffListener =
	(getCleanFormData: () => FormData) =>
	(formAreaElement: FormAreaElement): void => {
		const onChange = makeOnChange(formAreaElement, getCleanFormData);
		formAreaElement.addEventListener("change", onChange);
		formAreaElement.addEventListener("input", onChange);
		onChange();
	};

onFormRender(({forEachElement, getCleanFormData}) => forEachElement(addDiffListener(getCleanFormData)));
