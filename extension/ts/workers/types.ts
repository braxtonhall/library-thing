import {GetParameters, GetResponse} from "./impl/request";

enum WorkerKind {
	Get = "get",
}

type WorkerRequest<Kind extends WorkerKind> = Kind extends WorkerKind.Get ? GetParameters : never;

type TypedWorkerRequest<Kind extends WorkerKind> = {kind: WorkerKind, request: WorkerRequest<Kind>};

type WorkerResponse<Kind extends WorkerKind> = Kind extends WorkerKind.Get ? GetResponse : never;

type Worker<Kind extends WorkerKind> = (request: WorkerRequest<Kind>) => Promise<WorkerResponse<Kind>>;

type Workers = {
	[Kind in WorkerKind]: Worker<Kind>;
};

export {WorkerKind, Workers, WorkerRequest, WorkerResponse, TypedWorkerRequest};
