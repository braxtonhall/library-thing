import {BookRecord} from "./types";
import {makeCache} from "../../../common/util/cache";
const {syncCached, asyncCached, setCache} = makeCache<BookRecord>();
export {syncCached, asyncCached, setCache};
