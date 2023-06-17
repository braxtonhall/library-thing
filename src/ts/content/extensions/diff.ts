import "../../../sass/diff.sass";
import {FormData, getFormData, onFormRender} from "../entities/bookForm";
import {FormAreaElement} from "../entities/bookForm/types";
import {getFormDataForElement, getFormDataFromElement} from "../entities/bookForm/data";

let cleanFormData: FormData;

const makeOnChange = (formAreaElement: FormAreaElement) => {
	const savedData = getFormDataForElement(cleanFormData, formAreaElement);
	return () => {
		const {value: afterValue, checked: afterChecked} = getFormDataFromElement(formAreaElement);
		if (savedData === false || savedData.checked !== afterChecked || savedData.value !== afterValue) {
			formAreaElement.classList.add("vbl-dirty");
		} else {
			formAreaElement.classList.remove("vbl-dirty");
		}
	};
};

const addDiffListener = (formAreaElement: FormAreaElement): void => {
	const onChange = makeOnChange(formAreaElement);
	formAreaElement.addEventListener("change", onChange);
	formAreaElement.addEventListener("input", onChange);
	onChange();
};

onFormRender(({forEachElement}) => {
	cleanFormData = getFormData();
	console.log(cleanFormData["person_name-5"]);
	forEachElement(addDiffListener);
});
