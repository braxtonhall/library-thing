import {
	TypedWorkerRequest,
	WorkerError,
	WorkerKind,
	WorkerRequest,
	WorkerResponse,
	WorkerResponseValue,
	WorkerStatus,
} from "./types";
import * as browser from "webextension-polyfill";

const invokeWorker = <K extends WorkerKind>(kind: K, request: WorkerRequest<K>): Promise<WorkerResponseValue<K>> =>
	browser.runtime
		.sendMessage({
			message: "worker-message",
			kind,
			request,
		} satisfies TypedWorkerRequest<K>)
		.then((response: WorkerResponse<K>) => {
			if (response.status === WorkerStatus.RESOLVED) {
				return response.value;
			} else {
				throw new WorkerError(response.error, response.message);
			}
		});

export {invokeWorker};
