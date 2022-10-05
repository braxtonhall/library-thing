import {FinderParameters, FinderResponse} from "./finder/finder";

enum WorkerKind {
	Finder = "finder",
}

type WorkerRequest<Kind extends WorkerKind> = Kind extends WorkerKind.Finder ? FinderParameters : never;

type InternalWorkerRequest<Kind extends WorkerKind> = {kind: WorkerKind} & WorkerRequest<Kind>;

type WorkerResponse<Kind extends WorkerKind> = Kind extends WorkerKind.Finder ? FinderResponse : never;

type Worker<Kind extends WorkerKind> = (request: WorkerRequest<Kind>) => Promise<WorkerResponse<Kind>>;

type Workers = {
	[Kind in WorkerKind]: Worker<Kind>;
};

export {WorkerKind, Workers, WorkerRequest, WorkerResponse, InternalWorkerRequest};
