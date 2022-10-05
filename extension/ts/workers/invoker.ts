import {WorkerKind, WorkerRequest, WorkerResponse} from "./types";

const invokeWorker = async <K extends WorkerKind>(kind: K, request: WorkerRequest<K>): Promise<WorkerResponse<K>> => {
	return new Promise((resolve) => chrome.runtime.sendMessage({kind, ...request}, resolve));
};

export {invokeWorker};
