var Backbone = require('backbone');
sui = require('sui-utils/sui');

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		placeholder: '',
		description: '',
		custom:      ''
	},
});

sui.models.ShortcodeAttribute = ShortcodeAttribute;
module.exports = ShortcodeAttribute;