import * as browser from "webextension-polyfill";

type OpenOptionsParameters = null;
type OpenOptionsResponse = void;

const openOptions = () => browser.runtime.openOptionsPage();

export type {OpenOptionsResponse, OpenOptionsParameters};
export {openOptions};
