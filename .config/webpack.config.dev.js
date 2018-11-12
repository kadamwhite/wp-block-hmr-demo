/**
 * This file defines the configuration for development and dev-server builds.
 */
const { unlinkSync } = require( 'fs' );
const onExit = require( 'signal-exit' );
const webpack = require( 'webpack' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );

const { devServerPort, externals, filePath, srcPaths, stats } = require( './config-utils' );

// Clean up manifest on exit.
onExit( () => {
	try {
		unlinkSync( 'build/asset-manifest.json' );
	} catch ( e ) {
		// Silently ignore unlinking errors: so long as the file is gone, that is good.
	}
} );

const port = devServerPort();
const publicPath = `http://localhost:${ port }/build/`;

/**
 * Theme development build configuration.
 */
module.exports = {
	mode: 'development',
	devtool: 'cheap-module-source-map',
	context: process.cwd(),

	// Allow config to override shared devServer properties.
	devServer: {
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		hotOnly: true,
		watchOptions: {
			aggregateTimeout: 300,
		},
		stats,
		port,
	},
	optimization: {
		nodeEnv: 'development',
	},

	// Permit importing @wordpress/* packages.
	externals,

	// Specify where the code comes from.
	entry: {
		editor: filePath( 'src', 'index.js' ),
	},
	output: {
		// Add /* filename */ comments to generated require()s in the output.
		pathinfo: false,
		path: filePath( 'build' ),
		filename: '[name].js',
		publicPath,
	},

	module: {
		strictExportPresence: true,
		rules: [
			{
				// Process JS with Babel.
				test: /\.js$/,
				include: srcPaths,
				loader: require.resolve( 'babel-loader' ),
				options: {
					// Cache compilation results in ./node_modules/.cache/babel-loader/
					cacheDirectory: true,
				},
			},
		],
	},

	plugins: [
		// Generate a manifest file which contains a mapping of all asset filenames
		// to their corresponding output file so that PHP can pick up their paths.
		new ManifestPlugin( {
			fileName: 'asset-manifest.json',
			writeToFileEmit: true,
			publicPath,
		} ),
		// Enable HMR.
		new webpack.HotModuleReplacementPlugin(),
	],
};
