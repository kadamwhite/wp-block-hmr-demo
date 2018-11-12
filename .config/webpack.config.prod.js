/**
 * This file defines the configuration that is used for the production build.
 */
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );

const { filePath, externals, loaders, stats } = require( './config-utils' );

/**
 * Theme production build configuration.
 */
module.exports = {
	mode: 'production',
	devtool: 'hidden-source-map',
	context: process.cwd(),

	// Clean up build output
	stats,

	// Optimize output bundle.
	optimization: {
		minimizer: [ new UglifyJsPlugin( {
			sourceMap: true,
			uglifyOptions: {
				output: {
					comments: false,
				},
			},
		} ) ],
		noEmitOnErrors: true,
		nodeEnv: 'production',
	},
	entry: {
		editor: filePath( 'src', 'index.js' ),
	},
	output: {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: false,
		path: filePath( 'build' ),
		filename: '[name].js',
	},
	externals,
	module: {
		strictExportPresence: true,
		rules: [
			// First, run the linter before Babel processes the JS.
			loaders.eslint,
			{
				// "oneOf" will traverse all following loaders until one will
				// match the requirements. If no loader matches, it will fall
				// back to the "file" loader at the end of the loader list.
				oneOf: [
					// Inline any assets below a specified limit as data URLs to avoid requests.
					loaders.url,
					// Process JS with Babel.
					loaders.js,
					{
						test: /\.scss$/,
						use: [
							// Instead of using style-loader, extract CSS to its own file.
							MiniCssExtractPlugin.loader,
							// Process SASS into CSS.
							loaders.css,
							loaders.postcss,
							loaders.sass,
						],
					},
					// "file" loader makes sure any non-matching assets still get served.
					// When you `import` an asset you get its filename.
					loaders.file,
				],
			},
		],
	},

	plugins: [
		new MiniCssExtractPlugin( {
			filename: '[name].css',
		} ),
	],
};
