var Backbone = require('backbone');
var ShortcodeAttribute = require('sui-models/shortcode-attribute');

sui = require('sui-utils/sui');

/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({
	model : ShortcodeAttribute,
	//  Deep Clone.
	clone : function() {
		return new this.constructor(_.map(this.models, function(m) {
			return m.clone();
		}));
	}
});

sui.collections.ShortcodeAttributes = ShortcodeAttributes;
module.exports = ShortcodeAttributes;