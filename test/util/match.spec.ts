import {match} from "../../src/ts/common/util/match";
import {expect} from "chai";

describe("match", () => {
	it("should be able to evaluate a case", () => {
		const foo = match(10)
			.case(
				(value): value is 10 => value === 10,
				() => true
			)
			.default(() => false)
			.yield();
		expect(foo).to.be.true;
	});

	it("should be able to not match a case and go to the default case", () => {
		const foo = match(8)
			.case(
				(value): value is 10 => value === 10,
				() => true
			)
			.default(() => false)
			.yield();
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
			.default(() => "inf")
			.yield();
		expect(foo).to.equal("9");
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
	// @ts-expect-error Predicate parameter should be same type of match value
	match(foo).case(
		(value: string) => !!value,
		() => "string"
	);

	// @ts-expect-error Callback parameter should be consistent with type of predicate parameter
	match(foo).case<Bar, string>(
		(value: Bar): value is Bar => !!value,
		(value: Baz) => value.foo
	);
	match(foo).case<Bar, string>(
		(value: Bar): value is Bar => !!value,
		(value: Bar) => value.foo
	);

	// @ts-expect-error yield can only be called after a default
	match(foo)
		.case(
			(): boolean => true,
			() => ""
		)
		.yield();
	match(foo)
		.case(
			() => true,
			() => ""
		)
		.yield();
	match(foo)
		.default(() => "")
		.yield();

	// @ts-expect-error only yield can be called after a default
	match(foo)
		.default(() => "")
		.case(
			(value: string) => !!value,
			() => "string"
		);
	// @ts-expect-error only yield can be called after a default
	match(foo)
		.default(() => "")
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
		.default(() => "c" as const)
		.yield();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isAbc: "a" | "b" | "c" = abc;
	// @ts-expect-error yield types should be preserved when actually yielding
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isNotAbc: "a" = abc;
};
