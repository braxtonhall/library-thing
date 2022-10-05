const path = require('path');

const config = {
	context: path.join(__dirname, '/extension'),
	entry: {
		'copy': './ts/copy.ts',
		'warning': './ts/warning.ts',
		'colour': './ts/colour.ts',
		'pdf': './ts/pdf.ts',
		'background': './ts/workers/delegator.ts',
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
};

module.exports = (env, options) => {
	if (options.mode !== 'production') {
		config.devtool = 'source-map';
	}

	return config;
};
