var Backbone = require('backbone');

var ShortcodeAttribute = Backbone.Model.extend({

	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		encoded:     false,
		meta: {
			placeholder: '',
		},
	},

});

module.exports = ShortcodeAttribute;
