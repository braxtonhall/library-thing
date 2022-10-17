import Storage from "../../adapters/storage";

const API_KEY_LOCAL_STORAGE = "_api_key";

const getAPIKey = async (): Promise<string> => (await Storage.get(API_KEY_LOCAL_STORAGE)) ?? "";
const setAPIKey = async (key: string): Promise<string> => Storage.set(API_KEY_LOCAL_STORAGE, key);

export {getAPIKey, setAPIKey};
