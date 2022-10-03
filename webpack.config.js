const path = require('path');
const webpack = require('webpack');
require('dotenv').config();

const config = {
	context: path.join(__dirname, '/extension'),
	entry: {
		'copy': './ts/copy.ts',
		'warning': './ts/warning.ts',
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
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins: [
		new webpack.EnvironmentPlugin({
			LOGO_URL: '', // TODO will be useful when we emit both Chrome and FireFox extensions
		})
	]
};

module.exports = (env, options) => {
	if (options.mode !== 'production') {
		config.devtool = 'source-map';
	}

	return config;
};
