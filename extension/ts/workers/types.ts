import {GetParameters, GetResponse} from "./impl/request";

enum WorkerKind {
	Get = "get",
}

enum WorkerStatus {
	RESOLVED,
	REJECTED,
}

type WorkerRequest<Kind extends WorkerKind> = Kind extends WorkerKind.Get ? GetParameters : never;

type TypedWorkerRequest<Kind extends WorkerKind> = {kind: WorkerKind; request: WorkerRequest<Kind>};

type WorkerResponse<Kind extends WorkerKind> = WorkerResponseResolved<Kind> | WorkerResponseRejected;

type WorkerResponseResolved<Kind extends WorkerKind> = {
	status: WorkerStatus.RESOLVED;
	value: WorkerResponseValue<Kind>;
};
type WorkerResponseRejected = {status: WorkerStatus.REJECTED; message: string};

type WorkerResponseValue<Kind extends WorkerKind> = Kind extends WorkerKind.Get ? GetResponse : never;

type Worker<Kind extends WorkerKind> = (request: WorkerRequest<Kind>) => Promise<WorkerResponseValue<Kind>>;

type Workers = {
	[Kind in WorkerKind]: Worker<Kind>;
};

export {WorkerKind, Workers, WorkerRequest, WorkerResponse, WorkerResponseValue, TypedWorkerRequest, WorkerStatus};
