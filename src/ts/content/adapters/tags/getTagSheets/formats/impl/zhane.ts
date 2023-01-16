import {FormatStrategy} from "../index";
import {showToast, ToastType} from "../../../../../../common/ui/toast";

/**
 * This represents a format that is being used by the Tag Index, but it not
 * yet recognized by Better LibraryThing.
 *
 * This could happen if the extension is out of date.
 */

const WARNING =
	"hey! it seems like your installation of Better LibraryThing is a little out of date.\nclick here for update information!";

const zhane: FormatStrategy = async () => {
	showToast(WARNING, ToastType.WARNING, () => window.open("https://betterlibrarything.com/"));
	return [];
};

export {zhane};
