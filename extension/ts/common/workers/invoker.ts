import {WorkerError, WorkerKind, WorkerRequest, WorkerResponse, WorkerResponseValue, WorkerStatus} from "./types";

const invokeWorker = <K extends WorkerKind>(kind: K, request: WorkerRequest<K>): Promise<WorkerResponseValue<K>> => {
	return new Promise((resolve, reject) =>
		chrome.runtime.sendMessage(
			{
				kind,
				request,
			},
			(response: WorkerResponse<K>) => {
				if (response.status === WorkerStatus.RESOLVED) {
					return resolve(response.value);
				} else {
					return reject(new WorkerError(response.error, response.message));
				}
			}
		)
	);
};

export {invokeWorker};
