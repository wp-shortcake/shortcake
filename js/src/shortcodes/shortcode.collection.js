define( ['shortcodes/shortcode.model'], function ( Shortcode ) {
	'use strict';

	var Shortcodes = Backbone.Collection.extend({
		model: Shortcode
	});

	return Shortcodes;
});