var Backbone = require('backbone');

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		escape:      false,
		meta: {
			placeholder: '',
		}
	},
});

module.exports = ShortcodeAttribute;
