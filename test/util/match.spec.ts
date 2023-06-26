// noinspection BadExpressionStatementJS

import {match} from "../../src/ts/common/util/match";
import {expect} from "chai";

describe("match", () => {
	it("should be able to evaluate a case", () => {
		const foo = match(10)
			.case(
				(value): value is 10 => value === 10,
				() => true
			)
			.default(() => false);
		expect(foo).to.be.true;
	});

	it("should be able to not match a case and go to the default case", () => {
		const foo = match(8)
			.case(
				(value): value is 10 => value === 10,
				() => true
			)
			.default(() => false);
		expect(foo).to.be.false;
	});

	it("should reject some case, and match another", () => {
		const foo = match(9)
			.case(
				(value): value is 10 => value === 10,
				() => "10"
			)
			.case(
				(value): value is 9 => value === 9,
				() => "9"
			)
			.case(
				(value): value is 8 => value === 8,
				() => "8"
			)
			.default(() => "inf");
		expect(foo).to.equal("9");
	});

	it("should be able to yield without a default case", () => {
		let predicateCalled = false;
		let callbackCalled = false;
		const predicate = () => {
			predicateCalled = true;
			return false;
		};
		const callback = () => (callbackCalled = true);
		match(9).case(predicate, callback).yield();
		expect(predicateCalled).to.be.true;
		expect(callbackCalled).to.be.false;
	});

	it("should pass values to the callbacks", () => {
		const identity = <T>(x: T): typeof x => x;
		expect(
			match("foo")
				.case(() => true, identity)
				.yield()
		).to.equal("foo");
		expect(match("bar").default(identity)).to.equal("bar");
	});
});

// TYPE LEVEL TESTS

interface Foo {
	foo: "foo";
}

interface Bar extends Foo {
	bar: "bar";
}

interface Baz extends Foo {
	baz: "baz";
}

declare const foo: Foo;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const typeTests = () => {
	// Predicate parameter should be same type of match value
	match(foo).case(
		// @ts-expect-error Predicate parameter should be same type of match value
		(value: string) => !!value,
		() => "string"
	);

	// Callback parameter should be consistent with type of predicate parameter
	match(foo).case<Bar, string>(
		(value: Bar): value is Bar => !!value,
		// @ts-expect-error Callback parameter should be consistent with type of predicate parameter
		(value: Baz) => value.foo
	);
	match(foo).case<Bar, string>(
		(value: Bar): value is Bar => !!value,
		(value: Bar) => value.foo
	);

	// typed yield can only be called after a default
	match(foo)
		.case(
			(): boolean => true,
			() => ""
		)
		// @ts-expect-error calling yield before default results in void
		.yield() satisfies string;
	match(foo)
		.case(
			() => true,
			() => ""
		)
		.yield() satisfies string;
	match(foo).default(() => "") satisfies string;

	match(foo)
		.default(() => "")
		// @ts-expect-error only yield can be called after a default
		.case(
			(value: string) => !!value,
			() => "string"
		);
	match(foo)
		.default(() => "")
		// @ts-expect-error only yield can be called after a default
		.default(() => "string");

	// yield types should be preserved when actually yielding
	const abc = match(foo)
		.case(
			(): boolean => true,
			() => "a" as const
		)
		.case(
			(): boolean => true,
			() => "b" as const
		)
		.default(() => "c" as const);
	abc satisfies "a" | "b" | "c";
	// @ts-expect-error yield types should be preserved when actually yielding
	abc satisfies "a";

	// Yield after an always true case should behave like yield after a default
	const someCase = match(foo)
		.case(
			(): boolean => Math.random() < 0.5,
			() => "case 1" as const
		)
		.case(
			(): true => true,
			() => "case 2" as const
		)
		.yield();
	if (someCase === "case 1") {
		// 50% chance this happens
	}
	match(foo)
		.case(
			(): boolean => Math.random() < 0.5,
			() => "case 1" as const
		)
		.case(
			(): true => true,
			() => "case 2" as const
		)
		// @ts-expect-error yield after a always true case should behave like a default
		.yield() satisfies "case 2";
};
