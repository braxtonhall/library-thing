import {WorkerError, WorkerKind, WorkerRequest, WorkerResponse, WorkerResponseValue, WorkerStatus} from "./types";
import * as browser from "webextension-polyfill";

const invokeWorker = <K extends WorkerKind>(kind: K, request: WorkerRequest<K>): Promise<WorkerResponseValue<K>> =>
	browser.runtime
		.sendMessage({
			// TODO use satisfies from TS 4.9
			message: "worker-message",
			kind,
			request,
		})
		.then((response: WorkerResponse<K>) => {
			if (response.status === WorkerStatus.RESOLVED) {
				return response.value;
			} else {
				throw new WorkerError(response.error, response.message);
			}
		});

export {invokeWorker};
