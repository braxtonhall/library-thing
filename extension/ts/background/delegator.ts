import {TypedWorkerRequest, WorkerKind, WorkerRequest, Workers, Worker, WorkerStatus} from "../common/workers/types";
import {get} from "./workers/request";
import {authorize, deAuthorize} from "./workers/authorize";

const workers: Workers = {
	[WorkerKind.Get]: get,
	[WorkerKind.Authorize]: authorize,
	[WorkerKind.DeAuthorize]: deAuthorize,
};

chrome.runtime.onMessage.addListener(
	<Kind extends WorkerKind>(typedRequest: TypedWorkerRequest<Kind>, sender, sendResponse) => {
		const request = typedRequest.request as WorkerRequest<Kind>;
		const worker = workers[typedRequest.kind] as Worker<Kind>;
		worker(request)
			.then((value) => {
				return sendResponse({status: WorkerStatus.RESOLVED, value});
			})
			.catch(({message}) => {
				return sendResponse({status: WorkerStatus.REJECTED, message});
			});
		return true;
	}
);
