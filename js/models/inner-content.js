var Backbone = require('backbone');

sui = require('sui-utils/sui');

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : {
		label : '',
		type : 'textarea',
		value : '',
		placeholder : '',
	},
});

sui.models.InnerContent = InnerContent;
module.exports = InnerContent;

