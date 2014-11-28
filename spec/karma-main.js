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

	paths: {
		'jquery':			'/base/node_modules/jquery/dist/jquery',
		'underscore':		'/base/node_modules/backbone/node_modules/underscore/underscore',
		'backbone':			'/base/node_modules/backbone/backbone'
	},

	shim: {
		"backbone": {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		"underscore": {
			exports: '_'
		}
	},

	deps: ['jquery', 'underscore', 'backbone'],

	// Export jQuery, Underscore, and Backbone to global context to match expected runtime environment (WordPress).
	callback: function( jQuery, _, Backbone ) {
		// Export globals
		window.jQuery = window.$ = jQuery;
		window._ = _;
		window.backbone = Backbone;
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
		'squire':	'squirejs/src/Squire'
	},

	packages: [
		{ name: 'sinon', location: 'sinon', main: 'lib/sinon' }
	],

	deps: test_modules,

	callback: window.__karma__.start
});