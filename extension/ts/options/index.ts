import "../../sass/options.sass";
import {invokeWorker} from "../common/workers/invoker";
import {WorkerKind} from "../common/workers/types";

window.addEventListener("load", async () => {
	const loggedIn = !!(await invokeWorker(WorkerKind.Authorize, null));
	console.log(loggedIn);
});
