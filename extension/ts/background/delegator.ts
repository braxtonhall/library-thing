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
import {Message} from "../common/types";

const workers: Workers = {
	[WorkerKind.Get]: get,
	[WorkerKind.Authorize]: authorize,
	[WorkerKind.DeAuthorize]: deAuthorize,
};

const isTypedWorkerRequest = <Kind extends WorkerKind>(request: Message): request is TypedWorkerRequest<Kind> =>
	request.message === "worker-message";

chrome.runtime.onMessage.addListener(<Kind extends WorkerKind>(typedRequest: Message, sender, sendResponse) => {
	if (isTypedWorkerRequest(typedRequest)) {
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
});
