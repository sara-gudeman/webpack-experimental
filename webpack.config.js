const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');

const validate = require('webpack-validator');
const parts = require('./libs/parts');

const PATHS = {
	app: path.join(__dirname, 'app'),
	style: [
    path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'main.css')
  ],
	build: path.join(__dirname, 'build')
};

const common = {
	entry: {
		app: PATHS.app,
		style: PATHS.style
	},
	output: {
		path: PATHS.build,
		filename: '[name].js',
		// Modify the name of the generated sourcemap file.
		// You can use [file], [id], and [hash] replacements here.
		// The default option is enough for most use cases.
		sourceMapFilename: '[file].map', // Default

		// This is the sourcemap filename template. It's default format
		// depends on the devtool option used. You don't need to modify this
		// often.
		devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]'
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Webpack demo'
		})
	]
};

var config;

switch(process.env.npm_lifecycle_event) {
	case 'build':
		config = merge(
      common,
      {
      	devtool: 'source-map',
      	output: {
						path: PATHS.build,
						publicPath: '/webpack-experimental/',
						filename: '[name].[chunkhash].js',
						// This is used for require.ensure. The setup
						// will work without but this is useful to set.
						chunkFilename: '[chunkhash].js'
					}
      },
      parts.clean(PATHS.build),
      parts.setFreeVariable(
				'process.env.NODE_ENV',
				'production'
			),
			parts.extractBundle({
			  name: 'vendor',
			  entries: ['react']
			}),
      parts.minify(),

      parts.extractCSS(PATHS.style),
      parts.purifyCSS([PATHS.app])
    );
    break;
	default:
		config = merge(
      common,
      {
      	devtool: 'eval-source-map'
      },
      parts.setupCSS(PATHS.style),
      parts.devServer({
        // Customize host/port here if needed
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

// Run validator in quiet mode to avoid output in stats
module.exports = validate(config, {
  quiet: true
});