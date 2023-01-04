import config, {ConfigKey} from "./config";

const getSheetId = (): Promise<string> =>
	getSheetLink()
		.then(parseSheetId)
		.catch(() => {
			throw new Error("Provided sheet link was not valid");
		});

const getSheetLink = (): Promise<string> => config.get(ConfigKey.SpreadsheetLink);

const parseSheetId = (link: string): string => new URL(link).pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1];

const isValidSheetLink = async (link: string): Promise<boolean> => {
	// TODO ... if logged in, try pinging the sheet?
	try {
		const url = new URL(link);
		return url.host === "docs.google.com" && /\/spreadsheets\/d\/[a-zA-Z0-9]+/.test(url.pathname);
	} catch {
		return false;
	}
};

const isSheetSet = (): Promise<boolean> =>
	getSheetId()
		.then((id) => !!id)
		.catch(() => false);

export {getSheetId, getSheetLink, isValidSheetLink, isSheetSet};
