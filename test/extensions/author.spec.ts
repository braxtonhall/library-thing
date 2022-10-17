import {createUpdateBook} from "../../extension/ts/extensions/author/authorPage/updateBook";
import {AuthorRecord} from "../../extension/ts/adapters/author";
import {BookRecord} from "../../extension/ts/adapters/book";
import {expect} from "chai";

const testAuthors = new Map<string, AuthorRecord>([
	["1", {uuid: "1", tags: ["A author", "B author"], name: "1"}],
	["2", {uuid: "2", tags: ["B author", "C author"], name: "2"}],
]);
const getAuthor = async (uuid: string): Promise<AuthorRecord> => testAuthors.get(uuid);

const saveBook = async () => undefined;

describe("author extension", () => {
	describe("#updateBook", () => {
		const updateBook = createUpdateBook(getAuthor, saveBook);
		const createBook = (tags: string[], authorIds: string[]): BookRecord => ({id: "book", tags, authorIds});

		it("should leave non-author tags alone", async () => {
			const result = await updateBook("1", [])(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1"]));
		});

		it("should not add non-author tags", async () => {
			const result = await updateBook("1", ["baz"])(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1"]));
		});

		it("should add author tags", async () => {
			const result = await updateBook("1", ["Baz author"])(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author"], ["1"]));
		});

		it("should remove an author tag (1 author)", async () => {
			const result = await updateBook("1", ["Baz author"])(createBook(["foo", "bar", "Foobar author"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author"], ["1"]));
		});

		it("should add tags to a book with multiple authors", async () => {
			const result = await updateBook("1", ["Baz author"])(createBook(["foo", "bar"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author"], ["1", "2"]));
		});

		it("should remove an author tag that isn't on any other authors", async () => {
			const result = await updateBook("1", [])(createBook(["foo", "bar", "Foobar author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1", "2"]));
		});

		it("should not remove an author tag that is on another author", async () => {
			const result = await updateBook("1", [])(createBook(["foo", "bar", "C author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "C author"], ["1", "2"]));
		});

		it("should add and remove and retain tags at the same time", async () => {
			const result = await updateBook("1", ["Baz author"])(createBook(["foo", "bar", "Foobar author", "C author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "C author", "Baz author"], ["1", "2"]));
		});
	});
});
