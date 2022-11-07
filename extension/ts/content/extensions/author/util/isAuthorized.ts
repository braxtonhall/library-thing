import {invokeWorker} from "../../../../common/workers/invoker";
import {WorkerKind} from "../../../../common/workers/types";

const isAuthorized = async () => !!(await invokeWorker(WorkerKind.Authorize, false).catch(() => false));

export {isAuthorized};
