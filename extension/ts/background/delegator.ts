import {
	TypedWorkerRequest,
	WorkerKind,
	WorkerRequest,
	Workers,
	Worker,
	WorkerStatus,
	WorkerResponse,
	WorkerErrorKind,
} from "../common/workers/types";
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
				const resolved: WorkerResponse<Kind> = {status: WorkerStatus.RESOLVED, value};
				return sendResponse(resolved); // TODO use satisfies from TS 4.9
			})
			.catch(({message, kind = WorkerErrorKind.Unknown}) => {
				const rejected: WorkerResponse<Kind> = {status: WorkerStatus.REJECTED, error: kind, message};
				return sendResponse(rejected); // TODO use satisfies from TS 4.9
			});
		return true;
	}
);
