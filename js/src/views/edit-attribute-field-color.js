var sui = require('sui-utils/sui'),
    editAttributeField = require( 'sui-views/edit-attribute-field' ),
    $ = require('jquery');

sui.views.editAttributeFieldColor = editAttributeField.extend({

	// All events are being listened by iris, and they don't bubble very well,
	// so remove Backbone's listeners.
	events: {},

	render: function() {
		var self = this;

		var data = jQuery.extend( {
			id: 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid,
		}, this.model.toJSON() );

		// Convert meta JSON to attribute string.
		var _meta = [];
		for ( var key in data.meta ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.meta[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.meta[ key ] ) {
					_meta.push( _.escape( key ) );
				}

			} else {

				_meta.push( _.escape( key ) + '="' + _.escape( data.meta[ key ] ) + '"' );

			}

		}

		data.meta = _meta.join( ' ' );

		this.$el.html( this.template( data ) );
		this.triggerCallbacks();

		this.$el.find('input[type="text"]:not(.wp-color-picker)').wpColorPicker({
			change: function(e, ui) {
				self.setValue( $(this).wpColorPicker('color') );
				self.triggerCallbacks();
			}
		});

		return this;
	}

});

