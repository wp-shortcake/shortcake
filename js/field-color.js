var sui    = require('sui-utils/sui'),
    jQuery = require('jquery'),
    editAttributeField = require( 'sui-views/edit-attribute-field' );

( function( $, sui ) {

	sui.views.editAttributeFieldColor = editAttributeField.extend( {

		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );

			this.$el.find('input[type="text"]:not(.wp-color-picker)').wpColorPicker({
				change: function() {
					jQuery(this).trigger('keyup');
				}
			});

			return this;
		}

	} );

} )( jQuery, sui );
