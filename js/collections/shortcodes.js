var Backbone = require('backbone');
var Shortcode = require('sui-models/shortcode');
sui = require('sui-utils/sui');


// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

sui.collections.Shortcodes = Shortcodes;
module.exports = Shortcodes;
