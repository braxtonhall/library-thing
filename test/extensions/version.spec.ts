import {expect} from "chai";
import {
	toVersion,
	Version,
	versionEquals,
	versionLessThan
} from "../../extension/ts/content/extensions/version/version";

describe("version", () => {
	const testFunction = (fn: (a: Version, b: Version) => boolean) =>
		(a: string, b: string) => fn(toVersion(a), toVersion(b));

	describe("#toVersion", () => {
		it("should be able to parse valid versions", () => {
			expect(toVersion("1.3.0")).to.deep.equal({major: 1, minor: 3, revision: 0});
			expect(toVersion("9.9.9")).to.deep.equal({major: 9, minor: 9, revision: 9});
		});
	});

	describe("#versionEquals", () => {
		const eq = testFunction(versionEquals);

		it("should be able to tell when two versions are the same", () => {
			expect(eq("1.2.3", "1.2.3")).to.be.true;
			expect(eq("3.2.1", "3.2.1")).to.be.true;
		});

		it("should be able to tell when two versions have different major version", () => {
			expect(eq("1.0.0", "0.0.0")).to.be.false;
			expect(eq("1.0.0", "0.1.0")).to.be.false;
			expect(eq("1.1.0", "0.0.0")).to.be.false;
			expect(eq("1.0.1", "0.0.0")).to.be.false;
			expect(eq("1.0.0", "0.0.1")).to.be.false;
			expect(eq("0.0.0", "1.0.0")).to.be.false;
			expect(eq("0.0.0", "1.1.0")).to.be.false;
			expect(eq("0.1.0", "1.0.0")).to.be.false;
			expect(eq("0.0.1", "1.0.0")).to.be.false;
			expect(eq("0.0.0", "1.0.1")).to.be.false;
		});

		it("should be able to tell when two versions have different minor version", () => {
			expect(eq("0.1.0", "0.0.0")).to.be.false;
			expect(eq("0.1.1", "0.0.0")).to.be.false;
			expect(eq("0.1.0", "0.0.1")).to.be.false;
			expect(eq("0.0.0", "0.1.0")).to.be.false;
			expect(eq("0.0.1", "0.1.0")).to.be.false;
			expect(eq("0.0.0", "0.1.1")).to.be.false;
		});

		it("should be able to tell when two versions have different revision", () => {
			expect(eq("0.0.1", "0.0.0")).to.be.false;
			expect(eq("0.0.0", "0.0.1")).to.be.false;
		});
	});

	describe("#versionLessThan", () => {
		const lt = testFunction(versionLessThan);

		it("should not report lt when versions are the same", () => {
			expect(lt("1.1.0", "1.1.0")).to.be.false;
		});

		it("should report lt based on major version", () => {
			expect(lt("0.1.0", "1.1.0")).to.be.true;
			expect(lt("0.0.0", "1.1.0")).to.be.true;
			expect(lt("0.0.0", "1.0.1")).to.be.true;
			expect(lt("0.0.1", "1.1.0")).to.be.true;
		});

		it("should report gte based on major version", () => {
			expect(lt("1.1.0", "0.1.0")).to.be.false;
			expect(lt("1.1.0", "0.0.0")).to.be.false;
			expect(lt("1.0.1", "0.0.0")).to.be.false;
			expect(lt("1.1.0", "0.0.1")).to.be.false;
		});

		it("should report lt based on minor version", () => {
			expect(lt("1.0.0", "1.1.0")).to.be.true;
			expect(lt("1.0.1", "1.1.0")).to.be.true;
			expect(lt("1.0.0", "1.1.1")).to.be.true;
		});

		it("should report gte based on minor version", () => {
			expect(lt("1.1.0", "1.0.0")).to.be.false;
			expect(lt("1.1.0", "1.0.1")).to.be.false;
			expect(lt("1.1.1", "1.0.0")).to.be.false;
		});

		it("should report lt based on revision", () => {
			expect(lt("1.1.0", "1.1.1")).to.be.true;
		});

		it("should report gte based on revision", () => {
			expect(lt("1.1.1", "1.1.0")).to.be.false;
		});
	});
});
