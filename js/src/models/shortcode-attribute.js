var Backbone = require('backbone');

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:          '',
		label:         '',
		type:          '',
		value:         '',
		default_value: '',
		description:   '',
		meta: {
			placeholder: '',
		}
	},
});

module.exports = ShortcodeAttribute;
