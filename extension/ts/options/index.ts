import "../../sass/options.sass";
import {invokeWorker} from "../common/workers/invoker";
import {WorkerKind} from "../common/workers/types";

window.addEventListener("load", async () => {
	console.log(await invokeWorker(WorkerKind.Authorize, true));
});
