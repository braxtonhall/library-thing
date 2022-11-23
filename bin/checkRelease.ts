import * as fs from "fs";

const [tag] = process.argv.slice(2);

if (!/[0-9]+\.[0-9]+\.[0-9]+/.test(tag)) {
	throw "Tag not formatted correctly. Should be of the form '*.*.*'";
}

const manifest3 = JSON.parse(fs.readFileSync("./src/manifest.v3.json").toString());
if (manifest3.version !== tag) {
	throw `Tag does not match v3 manifest version '${manifest3.version}'`;
}

const manifest2 = JSON.parse(fs.readFileSync("./src/manifest.v2.json").toString());
if (manifest2.version !== tag) {
	throw `Tag does not match v2 manifest version '${manifest2.version}'`;
}

const releaseNotes = fs.existsSync(`./docs/releases/${tag}.md`);
if (!releaseNotes) {
	throw "No release notes were found for this version!";
}
