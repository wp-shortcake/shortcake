var Backbone = require('backbone');


/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({
	model : sui.models.ShortcodeAttribute,
	//  Deep Clone.
	clone : function() {
		return new this.constructor(_.map(this.models, function(m) {
			return m.clone();
		}));
	}
});

module.exports = ShortcodeAttributes;