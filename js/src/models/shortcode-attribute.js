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

	initialize: function() {

		// If value not encoded, set to the default for this field type.
		if ( ! this.get( 'encoded' ) && shortcodeUIFieldData[ this.get( 'type' ) ] ) {
			this.set( 'encoded', shortcodeUIFieldData[ this.get( 'type' ) ].encoded );
		}

	},

});

module.exports = ShortcodeAttribute;
