import {TypedWorkerRequest, WorkerKind, Workers} from "./types";
import {get} from "./impl/request";

const workers: Workers = {
	[WorkerKind.Get]: get,
};

chrome.runtime.onMessage.addListener(
	<Kind extends WorkerKind>(typedRequest: TypedWorkerRequest<Kind>, sender, sendResponse) => {
		workers[typedRequest.kind](typedRequest.request).then(sendResponse);
		return true;
	}
);
