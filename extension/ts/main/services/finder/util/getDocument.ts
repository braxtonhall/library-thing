import {invokeWorker} from "../../../../common/workers/invoker";
import {WorkerKind} from "../../../../common/workers/types";

const getDocument = async (url: string): Promise<Document> =>
	new DOMParser().parseFromString(await invokeWorker(WorkerKind.Get, url), "text/html");

export {getDocument};
