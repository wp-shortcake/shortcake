( function( $ ) {

	var sui = window.Shortcode_UI;

	sui.views.editAttributeFieldColor = sui.views.editAttributeField.extend( {

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

} )( jQuery );
