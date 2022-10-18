import {invokeWorker} from "../../../workers/invoker";
import {WorkerKind} from "../../../workers/types";

const isAuthorized = async () => !!(await invokeWorker(WorkerKind.Authorize, null).catch(() => false));

export {isAuthorized};
