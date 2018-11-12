/**
 * This file defines the configuration that is used for the production build.
 */
const UglifyJsPlugin = require( 'uglifyjs-webpack-plugin' );

const { filePath, externals, srcPaths, stats } = require( './config-utils' );

/**
 * Theme production build configuration.
 */
module.exports = {
	mode: 'production',
	devtool: 'hidden-source-map',
	context: process.cwd(),

	// Clean up build output
	stats,

	// Permit importing @wordpress/* packages.
	externals,

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

	// Specify where the code comes from.
	entry: {
		editor: filePath( 'src', 'index.js' ),
	},
	output: {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: false,
		path: filePath( 'build' ),
		filename: '[name].js',
	},

	module: {
		strictExportPresence: true,
		rules: [
			{
				// Process JS with Babel.
				test: /\.js$/,
				include: srcPaths,
				loader: require.resolve( 'babel-loader' ),
			},
		],
	},
};
