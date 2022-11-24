import config, {ConfigKey} from "./config";

const getSheetId = async (): Promise<string> => parseSheetId(await getSheetLink());

const getSheetLink = (): Promise<string> => config.get(ConfigKey.SpreadsheetLink);

const parseSheetId = (link: string): string => new URL(link).pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9]+)/)[1];

export {getSheetId, getSheetLink};
