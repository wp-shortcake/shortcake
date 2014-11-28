var test_modules = (function() {
	var modules = [];
	var pattern = /-spec\.js$/;

	Object.keys( window.__karma__.files ).forEach( function( file ) {
		if ( pattern.test( file ) ) {
			modules.push( file );
		}
	});

	return modules;
})();

require.config({
	// Karma serves files under /base, which is the basePath from your config file
	baseUrl: '/base/js/src',

	// example of using shim, to load non AMD libraries (such as underscore and jquery)
	paths: {
		'jquery':			'/base/lib/jquery/jquery-1.7.2',
		'underscore':		'/base/lib/underscore-min',
		'backbone':			'/base/lib/backbone-min'
	},

	packages: [
		{ name: 'when', location: 'lib/when', main: 'when' }
	],

	shim: {
		"backbone": {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		"underscore": {
			exports: '_'
		}
	}
});

/**
 * The `bootstrap` context for require is for the limited purpose of setting up the test
 * environment and *starting test execution*. The callback to `window.__karma__.start` is
 * intentionally omitted from the default context, to prevent conflict with Squire.js.
 */
require.config({
	context: 'bootstrap',

	baseUrl: '/base/node_modules',

	paths: {
		'chai': 	'chai/chai',
		'squire':	'squirejs/src/Squire',
		'jquery':	'/base/lib/jquery/jquery-1.7.2'
	},

	packages: [
		{ name: 'sinon', location: 'sinon', main: 'lib/sinon' }
	],

	deps: test_modules,

	callback: window.__karma__.start
});