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

module.exports = {
	devServerPort,
	externals,
	filePath,
	srcPaths,
	stats,
};
