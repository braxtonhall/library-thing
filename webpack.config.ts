import path from "path";
import {Configuration, DefinePlugin} from "webpack";

module.exports = (env, options): Configuration => ({
	devtool: options.mode !== 'production' ? 'source-map' : undefined,
	context: path.join(__dirname, '/extension'),
	entry: {
		'bundle': './ts/main/index.ts',
		'options': './ts/options/index.ts',
		'background': './ts/background/delegator.ts',
	},
	output: {
		path: path.join(__dirname, '/extension/js'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'ts-loader'
				},
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.s[ac]ss$/i,
				use: ["style-loader", "css-loader", "sass-loader"],
			}
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins: [
		new DefinePlugin({
			SPREADSHEET_ID: options.mode !== 'production'
				? JSON.stringify("18I5LabO21LfV97CkBRBW6SeK5hPggitvnK-2joUJ8jU")
				: JSON.stringify("1EfwBhY56M8OwgVjFTWxxxdoIxK8osw2vfgsXnCyGGuA"),
		})
	]
});
