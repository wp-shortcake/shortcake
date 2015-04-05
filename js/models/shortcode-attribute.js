var Backbone = require('backbone');

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		placeholder: '',
	},
});

module.exports = ShortcodeAttribute;
