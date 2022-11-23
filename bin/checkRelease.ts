import * as fs from "fs";

const [tag] = process.argv.slice(2);

if (!/[0-9]+\.[0-9]+\.[0-9]+/.test(tag)) {
	throw "Tag not formatted correctly. Should be of the form '*.*.*'";
}

const manifest = JSON.parse(fs.readFileSync("./src/manifest.json").toString());
if (manifest.version !== tag) {
	throw `Tag does not match v3 manifest version '${manifest.version}'`;
}

const releaseNotes = fs.existsSync(`./docs/releases/${tag}.md`);
if (!releaseNotes) {
	throw "No release notes were found for this version!";
}
