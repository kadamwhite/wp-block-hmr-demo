/**
 * This file defines the configuration for development and dev-server builds.
 */
const { unlinkSync } = require( 'fs' );
const onExit = require( 'signal-exit' );
const webpack = require( 'webpack' );
const HardSourceWebpackPlugin = require( 'hard-source-webpack-plugin' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );

const { devServerPort, externals, filePath, loaders, stats } = require( './config-utils' );

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
							require.resolve( 'style-loader' ),
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
		// Generate a manifest file which contains a mapping of all asset filenames
		// to their corresponding output file so that PHP can pick up their paths.
		new ManifestPlugin( {
			fileName: 'asset-manifest.json',
			writeToFileEmit: true,
			publicPath,
		} ),
		// Enable HMR.
		new webpack.HotModuleReplacementPlugin(),
		// Faster rebuilds.
		new HardSourceWebpackPlugin( {
			cacheDirectory: filePath( 'node_modules', '.cache', 'hard-source', '[confighash]' ),
			info: {
				level: 'warn',
			},
			cachePrune: {
				// Only delete caches older than two days.
				maxAge: 2 * 24 * 60 * 60 * 1000,
				// Only delete caches if cache folder is > 50mb.
				sizeThreshold: 50 * 1024 * 1024,
			},
		} ),
	],
};
