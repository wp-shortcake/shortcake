var Backbone = require('backbone');
var Shortcode = require('sui-models/shortcode');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;
