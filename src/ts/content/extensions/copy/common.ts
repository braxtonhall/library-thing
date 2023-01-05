import {FormData} from "../../entities/bookForm";
import config, {ConfigKey} from "../../../common/entities/config";
import {showToast, ToastType} from "../../../common/ui/toast";

const saveFormData = async (formData: FormData) => {
	await config.set(ConfigKey.FormData, formData);
	showToast(
		"The metadata for this book was saved!\n\nYou can use the Paste button on a different book's page to paste in your saved metadata.",
		ToastType.SUCCESS
	);
};

export {saveFormData};
