/**
 * Utility methods for use when generating build configuration objects.
 */
const { join } = require( 'path' );
const autoprefixer = require( 'autoprefixer' );
const postcssFlexbugsFixes = require( 'postcss-flexbugs-fixes' );

/**
 * Given a string, returns a new string with dash separators converted to
 * camel-case equivalent. This is not as aggressive as `_.camelCase`, which
 * which would also upper-case letters following numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
const camelCaseDash = string => string.replace(
	/-([a-z])/g,
	( match, letter ) => letter.toUpperCase()
);

/**
 * Return the specified port on which to run the dev server.
 */
const devServerPort = () => parseInt( process.env.PORT, 10 ) || 3001;

/**
 * Define externals to load components through the wp global.
 */
const externals = [
	'blocks',
	'components',
	'compose',
	'data',
	'edit-post',
	'element',
	'i18n',
	'plugins',
].reduce( ( externals, name ) => ( {
	...externals,
	[ `@wordpress/${ name }` ]: `wp.${ camelCaseDash( name ) }`,
} ), {
	wp: 'wp',
} );

/**
 * Return the absolute file system path to a file within the content/ folder.
 * @param  {...String} relPaths Strings describing a file relative to the content/ folder.
 * @returns {String} An absolute file system path.
 */
const filePath = ( ...relPaths ) => join( process.cwd(), ...relPaths );

/**
 * An array of file system paths in which to find first-party source code.
 * Used to limit Webpack transforms like Babel to just those folders containing our code.
 */
const srcPaths = [
	filePath( 'src' ),
];

/**
 * Webpack stats definition object to reign in excessive build output.
 */
const stats = {
	all: false,
	assets: true,
	colors: true,
	errors: true,
	performance: true,
	timings: true,
	warnings: true,
};

/**
 * Loader configuration objects which can be re-used in the dev and prod build config files.
 */
const loaders = {
	eslint: {
		test: /\.(js|jsx|mjs)$/,
		include: srcPaths,
		enforce: 'pre',
		use: [ {
			options: {
				eslintPath: require.resolve( 'eslint' ),
			},
			loader: require.resolve( 'eslint-loader' ),
		} ],
	},
	url: {
		test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
		loader: require.resolve( 'url-loader' ),
		options: {
			limit: 10000,
		},
	},
	js: {
		test: /\.js$/,
		include: srcPaths,
		loader: require.resolve( 'babel-loader' ),
		options: {
			// Cache compilation results in ./node_modules/.cache/babel-loader/
			cacheDirectory: true,
		},
	},
	css: {
		loader: require.resolve( 'css-loader' ),
		options: {
			importLoaders: 1,
		},
	},
	postcss: {
		loader: require.resolve( 'postcss-loader' ),
		options: {
			ident: 'postcss',
			plugins: () => [
				postcssFlexbugsFixes,
				autoprefixer( {
					browsers: [
						'>1%',
						'last 4 versions',
						'Firefox ESR',
						'not ie < 10',
					],
					flexbox: 'no-2009',
				} ),
			],
		},
	},
	sass: {
		loader: require.resolve( 'sass-loader' ),
	},
	file: {
		// Exclude `js`, `html` and `json`, but match anything else.
		exclude: [ /\.js$/, /\.html$/, /\.json$/ ],
		loader: require.resolve( 'file-loader' ),
	},
};

module.exports = {
	devServerPort,
	externals,
	filePath,
	srcPaths,
	stats,
	loaders,
};
