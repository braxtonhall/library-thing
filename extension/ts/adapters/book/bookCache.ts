import {BookRecord} from "./types";
import {makeCache} from "../../util/cache";
const {syncCached, asyncCached} = makeCache<BookRecord>();
export {syncCached, asyncCached};
