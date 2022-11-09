import {expect} from "chai";
import {incrementColumnBy} from "../../extension/ts/main/adapters/sheets/util";

describe("sheets", () => {
	describe("/util", () => {
		describe("#incrementColumnBy", () => {
			it("should not increment if given a zero", () => {
				expect(incrementColumnBy("A", 0)).to.equal("A");
			});

			it("should not increment a larger string if given a zero", () => {
				expect(incrementColumnBy("ABC", 0)).to.equal("ABC");
			});

			it("should not increment an empty string if given a zero", () => {
				expect(incrementColumnBy("", 0)).to.equal("");
			});

			it("should increment by one", () => {
				expect(incrementColumnBy("A", 1)).to.equal("B");
				expect(incrementColumnBy("D", 1)).to.equal("E");
				expect(incrementColumnBy("Y", 1)).to.equal("Z");
			});

			it("should increment a larger string by one", () => {
				expect(incrementColumnBy("FA", 1)).to.equal("FB");
				expect(incrementColumnBy("DDD", 1)).to.equal("DDE");
				expect(incrementColumnBy("FRIDAY", 1)).to.equal("FRIDAZ");
			});

			it("should increment nothing into an A", () => {
				expect(incrementColumnBy("", 1)).to.equal("A");
			});

			it("should increment by N", () => {
				expect(incrementColumnBy("A", 2)).to.equal("C");
				expect(incrementColumnBy("B", 3)).to.equal("E");
				expect(incrementColumnBy("C", 4)).to.equal("G");
			});

			it("should increment by N on larger string", () => {
				expect(incrementColumnBy("ZA", 2)).to.equal("ZC");
				expect(incrementColumnBy("GGB", 3)).to.equal("GGE");
				expect(incrementColumnBy("AKC", 4)).to.equal("AKG");
			});

			it("should increment by N on empty string", () => {
				expect(incrementColumnBy("", 2)).to.equal("B");
				expect(incrementColumnBy("", 3)).to.equal("C");
			});

			it("should handle overflow", () => {
				expect(incrementColumnBy("Z", 1)).to.equal("AA");
			});

			it("should handle overflow on large string", () => {
				expect(incrementColumnBy("ABCDEFZ", 1)).to.equal("ABCDEGA");
			});

			it("should handle repeated overflow", () => {
				expect(incrementColumnBy("ABCZZZZ", 1)).to.equal("ABDAAAA");
				expect(incrementColumnBy("ZZZZ", 1)).to.equal("AAAAA");
			});

			it("should handle overflow from an empty string with a big enough step", () => {
				expect(incrementColumnBy("", 27)).to.equal("AA");
			});
		});
	});
});
