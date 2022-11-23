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

import * as browser from "webextension-polyfill";

const workers: Workers = {
	[WorkerKind.Get]: get,
	[WorkerKind.Authorize]: authorize,
	[WorkerKind.DeAuthorize]: deAuthorize,
};

const isTypedWorkerRequest = <Kind extends WorkerKind>(request: Message): request is TypedWorkerRequest<Kind> =>
	request.message === "worker-message";

browser.runtime.onMessage.addListener(
	<Kind extends WorkerKind>(typedRequest: Message): Promise<WorkerResponse<Kind>> => {
		if (isTypedWorkerRequest(typedRequest)) {
			const request = typedRequest.request as WorkerRequest<Kind>;
			const worker = workers[typedRequest.kind] as Worker<Kind>;
			return worker(request)
				.then((value) => {
					const resolved: WorkerResponse<Kind> = {status: WorkerStatus.RESOLVED, value};
					return resolved;
				})
				.catch(({message, kind = WorkerErrorKind.Unknown}) => {
					const rejected: WorkerResponse<Kind> = {status: WorkerStatus.REJECTED, error: kind, message};
					return rejected;
				});
		}
	}
);
