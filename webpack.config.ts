import path from "path";
import {Configuration, EnvironmentPlugin, WebpackOptionsNormalized} from "webpack";
import CopyPlugin, {TransformerFunction} from "copy-webpack-plugin";

import config from "./mv3-hot-reload.config";
import {toV2} from "./bin/toV2";

const isDev = (options: WebpackOptionsNormalized) => options.mode !== "production";

const manifestVersion = process.env.MANIFEST_VERSION ?? "v3";
const srcDir = path.join(__dirname, "src");
const tsSrcDir = path.join(srcDir, "ts");
const outputDir = path.join(__dirname, "dist", manifestVersion);
const getEntry = (name: string, options) => {
	return [path.join(tsSrcDir, name), "webextension-polyfill/dist/browser-polyfill.js", ...(isDev(options) ? [`mv3-hot-reload/${name}`] : [])];
};

const transform: TransformerFunction = (input: Buffer) => {
	const v3 = JSON.parse(input.toString());
	const v2 = toV2(v3);
	return JSON.stringify(v2, null, "\t");
};

const maybeTransform = () =>
	manifestVersion === "v2" && {transform};

module.exports = (_env: any, options: WebpackOptionsNormalized): Configuration => ({
	devtool: isDev(options) ? "source-map" : undefined,
	entry: {
		options: path.join(tsSrcDir, "options"),
		bundle: getEntry("content", options),
		background: getEntry("background", options),
	},
	output: {
		path: path.join(outputDir, "js"),
		filename: "[name].js",
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: {
					loader: "ts-loader",
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.s[ac]ss$/i,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	plugins: [
		new EnvironmentPlugin({
			MV3_HOT_RELOAD_PORT: config.port,
		}),
		new CopyPlugin({
			patterns: [
				{from: path.join(srcDir, "html"), to: path.join(outputDir, "html")},
				{from: path.join(srcDir, "img"), to: path.join(outputDir, "img")},
				{
					from: path.join(srcDir, "manifest.json"),
					to: path.join(outputDir, "manifest.json"),
					...maybeTransform(),
				}
			]
		}),
	],
	optimization: {
		minimize: false
	},
});
