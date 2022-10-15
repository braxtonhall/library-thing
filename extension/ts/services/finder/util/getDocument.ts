import {invokeWorker} from "../../../workers/invoker";
import {WorkerKind} from "../../../workers/types";

const getDocument = async (url: string): Promise<Document> =>
	new DOMParser().parseFromString(await invokeWorker(WorkerKind.Get, url), "text/html");

export {getDocument};
