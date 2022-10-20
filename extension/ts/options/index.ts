import "../../sass/options.sass";

import {invokeWorker} from "../workers/invoker";
import {WorkerKind} from "../workers/types";

window.addEventListener("load", async () => {
	const loggedIn = !!(await invokeWorker(WorkerKind.Authorize, null));
	console.log(loggedIn);
});
