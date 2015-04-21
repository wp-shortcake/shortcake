var Backbone = require('backbone');

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		customAttributes: {
			placeholder: '',
		}
	},

	initialize: function() {

		// Handle legacy custom attributes.
		if ( this.get('placeholder' ) ) {
			var customAttributes = this.get('customAttributes');
			customAttributes[ 'placeholder' ] = this.get('placeholder');
		}
	}

});

module.exports = ShortcodeAttribute;
