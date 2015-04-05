var Backbone = require('backbone');

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : {
		label:       shortcodeUIData.strings.insert_content_label,
		type:        'textarea',
		value:       '',
		placeholder: '',
	},
});

module.exports = InnerContent;
