import {invokeWorker} from "../../../common/workers/invoker";
import {WorkerKind} from "../../../common/workers/types";
import {showToast, ToastType} from "../../ui/toast";

const handleError = (res: Response): Response => {
	if (!res.ok) {
		showToast("Could not complete action", ToastType.ERROR);
	}
	return res;
};

type GoogleFetch = <T>(...args: Parameters<typeof fetch>) => Promise<T | null>;

const appendAuthorization = async (init?: RequestInit): Promise<RequestInit> => {
	init ??= {};
	init.headers ??= {};
	const token = await invokeWorker(WorkerKind.Authorize, false);
	init = {...init, headers: {...init.headers, Authorization: `Bearer ${token}`}};
	return init;
};

export const googleFetch: GoogleFetch = async (input: URL, init?: RequestInit) => {
	const authorizedInit = await appendAuthorization(init);
	const res = await fetch(input, authorizedInit).then(handleError);
	return res.ok ? res.json() : null;
};
