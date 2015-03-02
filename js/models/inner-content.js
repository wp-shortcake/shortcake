var Backbone = require('backbone');

sui = require('sui-utils/sui');

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : false,
});

sui.models.InnerContent = InnerContent;
module.exports = InnerContent;

