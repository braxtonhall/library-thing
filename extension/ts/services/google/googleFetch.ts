import {invokeWorker} from "../../workers/invoker";
import {WorkerKind} from "../../workers/types";

const handleError = (res: Response) => {
	if (res.status >= 400) {
		alert(
			"Something went wrong when trying to process that action. Please try again and ensure the inputted API key/ Client ID credentials are correct."
		);
	}
};

type GoogleFetch = <T>(...args: Parameters<typeof fetch>) => Promise<T | null>;

export const googleFetch: GoogleFetch = async (input: URL, init?: RequestInit) => {
	const url = new URL(input);
	const params = new URLSearchParams(url.search);
	url.search = params.toString();
	init ??= {};
	init.headers ??= {};

	if (init.method !== "GET") {
		const token = await invokeWorker(WorkerKind.Authorize, null);
		init = {...init, headers: {...init.headers, Authorization: `Bearer ${token}`}};
	}

	const res = await fetch(input, init);
	handleError(res);
	return res.status === 200 ? res.json() : null;
};
