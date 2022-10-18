import {createPushBookTags, createSyncBookTags} from "../../extension/ts/extensions/author/util";
import {AuthorRecord} from "../../extension/ts/adapters/author";
import {BookRecord} from "../../extension/ts/adapters/book";
import {expect} from "chai";

const testAuthors = new Map<string, AuthorRecord>([
	["1", {uuid: "1", tags: [], name: "1"}],
	["2", {uuid: "2", tags: ["B author", "C author"], name: "2"}],
]);
const getAuthor = async (uuid: string): Promise<AuthorRecord> => testAuthors.get(uuid);
const setAuthor = (id: string, tags: string[]) => testAuthors.get(id).tags = tags;
const createBook = (tags: string[], authorIds: string[]): BookRecord => ({id: "book", tags, authorIds});

const saveBook = async () => undefined;

describe("author extension", () => {
	describe("#syncBook", () => {
		const updateBook = createSyncBookTags(getAuthor, saveBook);

		it("should leave non-author tags alone", async () => {
			setAuthor("1", []);
			const result = await updateBook(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1"]));
		});

		it("should not add non-author tags", async () => {
			setAuthor("1", ["baz"]);
			const result = await updateBook(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1"]));
		});

		it("should add author tags", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author"], ["1"]));
		});

		it("should remove author tags from a book with no authors", async () => {
			const result = await updateBook(createBook(["foo", "bar", "foo author"], []));
			expect(result).to.deep.equal(createBook(["foo", "bar"], []));
		});

		it("should remove an author tag (1 author)", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar", "Foobar author"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author"], ["1"]));
		});

		it("should add tags to a book with multiple authors", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author", "B author", "C author"], ["1", "2"]));
		});

		it("should remove an author tag that isn't on any other authors", async () => {
			setAuthor("1", []);
			const result = await updateBook(createBook(["foo", "bar", "Foobar author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "B author", "C author"], ["1", "2"]));
		});

		it("should not remove an author tag that is on another author", async () => {
			setAuthor("1", []);
			const result = await updateBook(createBook(["foo", "bar", "C author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "B author", "C author"], ["1", "2"]));
		});

		it("should add and remove and retain tags at the same time", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar", "Foobar author", "C author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author", "B author", "C author"], ["1", "2"]));
		});
	});

	describe("#pushBook", () => {
		const updateBook = createPushBookTags(getAuthor, saveBook);

		it("should leave non-author tags alone", async () => {
			setAuthor("1", []);
			const result = await updateBook(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1"]));
		});

		it("should not add non-author tags", async () => {
			setAuthor("1", ["baz"]);
			const result = await updateBook(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar"], ["1"]));
		});

		it("should add author tags", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author"], ["1"]));
		});

		it("should not remove author tags from a book with no authors", async () => {
			const result = await updateBook(createBook(["foo", "bar", "foo author"], []));
			expect(result).to.deep.equal(createBook(["foo", "bar", "foo author"], []));
		});

		it("should not remove an author tag (1 author)", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar", "Foobar author"], ["1"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Foobar author", "Baz author"], ["1"]));
		});

		it("should add tags to a book with multiple authors", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Baz author", "B author", "C author"], ["1", "2"]));
		});

		it("should not remove an author tag (multiple authors)", async () => {
			setAuthor("1", []);
			const result = await updateBook(createBook(["foo", "bar", "Foobar author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Foobar author", "B author", "C author"], ["1", "2"]));
		});

		it("should add and remove and retain tags at the same time", async () => {
			setAuthor("1", ["Baz author"]);
			const result = await updateBook(createBook(["foo", "bar", "Foobar author", "C author"], ["1", "2"]));
			expect(result).to.deep.equal(createBook(["foo", "bar", "Foobar author", "C author", "Baz author", "B author"], ["1", "2"]));
		});
	});
});
