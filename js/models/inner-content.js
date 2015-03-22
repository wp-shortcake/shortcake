var Backbone = require('backbone');

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : {
		label:       shortcodeUIData.strings.media_frame_toolbar_insert_label,
		type:        'textbox',
		value:       '',
		placeholder: '',
	},
});

module.exports = InnerContent;
