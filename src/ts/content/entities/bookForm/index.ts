import {FormData} from "./types";
import {
	onFormRender,
	offFormRender,
	onceFormRender,
	onFormRemoved,
	onceFormRemoved,
	offFormRemoved,
	ForEachFormElement,
	FormRenderListener,
} from "./render";
import {formDataEquals, formExists} from "./util";
import {getFormData, insertFormData} from "./data";
import {OnSave, OffSave} from "./state";

export type {FormData, ForEachFormElement, FormRenderListener, OnSave, OffSave};
export {
	insertFormData,
	getFormData,
	onFormRender,
	formExists,
	offFormRender,
	onceFormRender,
	formDataEquals,
	onFormRemoved,
	onceFormRemoved,
	offFormRemoved,
};
