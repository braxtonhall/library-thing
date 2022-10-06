import {TypedWorkerRequest, WorkerKind, Workers} from "./types";
import {find} from "./finder/finder";

const workers: Workers = {
	[WorkerKind.Finder]: find,
};

chrome.runtime.onMessage.addListener(<Kind extends WorkerKind>(typedRequest: TypedWorkerRequest<Kind>, sender, sendResponse) => {
	workers[typedRequest.kind](typedRequest.request).then(sendResponse);
	return true;
});
