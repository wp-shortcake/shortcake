var Backbone = require('backbone');

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults: {
		label:       shortcodeUIData.strings.default_content_label,
		placeholder: '',
	},
});

module.exports = InnerContent;
