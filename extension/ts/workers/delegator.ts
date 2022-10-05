import {InternalWorkerRequest, WorkerKind, Workers} from "./types";
import {find} from "./finder/finder";

const workers: Workers = {
	[WorkerKind.Finder]: find,
}

chrome.runtime.onMessage.addListener(<Kind extends WorkerKind>(request: InternalWorkerRequest<Kind>, sender, sendResponse) => {
	workers[request.kind](request).then(sendResponse);
	return true;
});
