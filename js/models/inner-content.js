var Backbone = require('backbone');

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults: {
		attr:        'inner_content',
		label:       shortcodeUIData.strings.default_content_label,
		type:        'textarea',
		placeholder: '',
	},
});

module.exports = InnerContent;
