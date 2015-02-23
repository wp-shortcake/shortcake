var Backbone = require('backbone');
sui = require('sui-utils/sui');

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		placeholder: '',
	},
});

sui.models.ShortcodeAttribute = ShortcodeAttribute;
module.exports = ShortcodeAttribute;