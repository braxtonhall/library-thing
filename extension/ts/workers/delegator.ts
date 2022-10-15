import {TypedWorkerRequest, WorkerKind, Workers, WorkerStatus} from "./types";
import {get} from "./impl/request";

const workers: Workers = {
	[WorkerKind.Get]: get,
};

chrome.runtime.onMessage.addListener(
	<Kind extends WorkerKind>(typedRequest: TypedWorkerRequest<Kind>, sender, sendResponse) => {
		workers[typedRequest.kind](typedRequest.request)
			.then((value) => {
				return sendResponse({status: WorkerStatus.RESOLVED, value});
			})
			.catch(({message}) => {
				return sendResponse({status: WorkerStatus.REJECTED, message});
			});
		return true;
	}
);
