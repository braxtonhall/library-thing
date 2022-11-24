import {makeCache} from "../../src/ts/common/util/cache";
import {sleep} from "../../src/ts/common/util/sleep";
import {expect} from "chai";

describe("cache", () => {
	const id = "ID";
	let syncCached: (id: string, implementation: () => string) => string;
	let asyncCached: (id: string, implementation: () => Promise<string>) => Promise<string>;
	let setCache: (id: string, value: string) => string;
	let sideEffectCounter = 0;

	const syncGetValue = (value: string) => (): string => {
		sideEffectCounter++;
		return value;
	};

	const asyncGetValue =
		(value: string, ms = 0) =>
		() =>
			sleep(ms).then(syncGetValue(value));

	beforeEach(() => {
		const cache = makeCache<string>();
		sideEffectCounter = 0;
		syncCached = cache.syncCached;
		asyncCached = cache.asyncCached;
		setCache = cache.setCache;
	});

	it("should be able to get item through set cache", () => {
		const value = setCache(id, "foo");
		expect(value).to.deep.equal("foo");
	});

	it("should be able to get item through caching invocation", () => {
		const value = syncCached(id, syncGetValue("foo"));
		expect(value).to.deep.equal("foo");
	});

	it("should be able to get item through async caching invocation", async () => {
		const value = await asyncCached(id, asyncGetValue("foo"));
		expect(value).to.deep.equal("foo");
	});

	it("should not invoke implementation after sync caching", async () => {
		syncCached(id, syncGetValue("foo"));
		expect(sideEffectCounter).to.equal(1);

		const syncValue = syncCached(id, syncGetValue("bar"));
		expect(sideEffectCounter).to.equal(1);
		expect(syncValue).to.deep.equal("foo");

		const asyncValue = await asyncCached(id, asyncGetValue("bar"));
		expect(sideEffectCounter).to.equal(1);
		expect(asyncValue).to.deep.equal("foo");
	});

	it("should not invoke implementation after async caching", async () => {
		await asyncCached(id, asyncGetValue("foo"));
		expect(sideEffectCounter).to.equal(1);

		const syncValue = syncCached(id, syncGetValue("bar"));
		expect(sideEffectCounter).to.equal(1);
		expect(syncValue).to.deep.equal("foo");

		const asyncValue = await asyncCached(id, asyncGetValue("bar"));
		expect(sideEffectCounter).to.equal(1);
		expect(asyncValue).to.deep.equal("foo");
	});

	it("should not invoke implementation after a set cache", async () => {
		setCache(id, "foo");
		expect(sideEffectCounter).to.equal(0);

		const syncValue = syncCached(id, syncGetValue("bar"));
		expect(sideEffectCounter).to.equal(0);
		expect(syncValue).to.deep.equal("foo");

		const asyncValue = await asyncCached(id, asyncGetValue("bar"));
		expect(sideEffectCounter).to.equal(0);
		expect(asyncValue).to.deep.equal("foo");
	});

	it("should be able to make separate caches", async () => {
		const otherCache = makeCache<string>();
		syncCached(id, syncGetValue("foo"));
		otherCache.syncCached(id, syncGetValue("foo"));
		expect(sideEffectCounter).to.equal(2);
	});

	it("should enforce locking mechanism", async () => {
		asyncCached(id, asyncGetValue("foo", 10)); // Very, very slow
		expect(sideEffectCounter).to.equal(0);
		const value = await asyncCached(id, asyncGetValue("bar")); // Instant
		expect(value).to.deep.equal("foo");
		expect(sideEffectCounter).to.equal(1);
	});

	it("should ignore the locking mechanism if synchronous", async () => {
		const futureValue = asyncCached(id, asyncGetValue("bar", 10));
		const syncValue = syncCached(id, syncGetValue("foo"));
		const asyncValue = await futureValue;
		expect(syncValue).to.deep.equal("foo");
		expect(asyncValue).to.deep.equal("foo");
		expect(sideEffectCounter).to.equal(2);
	});

	it("should ignore the locking mechanism if using set cache", async () => {
		const futureValue = asyncCached(id, asyncGetValue("bar", 10));
		setCache(id, "foo");
		expect(await futureValue).to.deep.equal("foo");
		expect(sideEffectCounter).to.equal(1);
	});
});
