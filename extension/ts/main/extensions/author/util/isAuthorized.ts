import {invokeWorker} from "../../../../common/workers/invoker";
import {WorkerKind} from "../../../../common/workers/types";

const isAuthorized = async () => !!(await invokeWorker(WorkerKind.Authorize, null).catch(() => false));

export {isAuthorized};
