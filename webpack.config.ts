import path from "path";
import {Configuration, DefinePlugin, EnvironmentPlugin, WebpackOptionsNormalized} from "webpack";

import config from "./mv3-hot-reload.config";

const isDev = (options: WebpackOptionsNormalized) => options.mode !== "production";

const srcDir = path.join(__dirname, "extension");
const tsSrcDir = path.join(srcDir, "ts");
const getEntry = (name: string) => {
	return [path.join(tsSrcDir, name), ...(isDev ? [`mv3-hot-reload/${name}`] : [])];
};

module.exports = (_env: any, options: WebpackOptionsNormalized): Configuration => ({
	devtool: isDev(options) ? "source-map" : undefined,
	// @ts-ignore
	devServer: {
		hot: true,
		firewall: false,
		port: 3912,
		devMiddleware: {
			writeToDisk: true,
		},
		static: {
			watch: false,
		},
		client: {
			host: "localhost",
		},
	},
	entry: {
		options: path.join(tsSrcDir, "options"),
		bundle: getEntry("content"),
		background: getEntry("background"),
	},
	output: {
		path: path.join(srcDir, "js"),
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
		new DefinePlugin({
			SPREADSHEET_ID: isDev(options)
				? JSON.stringify("18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU")
				: JSON.stringify("1EfwBhY56M8OwgVjFTWxxxdoIxK8osw2vfgsXnCyGGuA"),
		}),
		new EnvironmentPlugin({
			MV3_HOT_RELOAD_PORT: config.port,
		}),
	],
});
