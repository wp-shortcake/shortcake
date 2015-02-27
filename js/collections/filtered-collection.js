var Backbone = require('backbone');
var Shortcode = require('sui-models/shortcode');
sui = require('sui-utils/sui');

//Shortcode Collection
var FilteredCollection = Backbone.Collection.extend({
	model : Shortcode
});

sui.collections.FilteredCollection = FilteredCollection;
module.exports = FilteredCollection;
