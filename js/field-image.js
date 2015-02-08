( function( $ ) {

	var sui = window.Shortcode_UI;

	sui.views.editAttributeFieldImage = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-image': 'updateValue',
		},

		render: function() {

			var self = this;

			self.$el.html( self.template( self.model.toJSON() ) );

			var container = self.$el.find( '.shortcake-image-field-preview' );
			var button    = self.$el.find( '.shortcake-image-field-preview button' );
			var input     = self.$el.find( 'input' );
			var removeButton = $( '<button/>', { class: 'button', html: 'x' } );

			var CMB_Frame = wp.media( {
				multiple: false,
				title: 'Select File',
				// library: frameLibraryType,
			} );

			self.addImage = function( id ) {

				wp.ajax.post( 'shortcode_ui_get_image', {
					id: id,
					size: 'thumbnail',
					nonce: shortcodeUIData.nonces.thumbnailImage
				} ).done( function( response ) {
					container.append( response.html );
					input.val( id );
					button.hide();
					removeButton.appendTo( container );
				} );

			}

			self.removeImage = function() {
				$(this).remove();
				container.find( 'img' ).remove();
				button.show();
			}

			var value = self.model.get( 'value' );
			if ( value ) {
				self.addImage( value );
			}

			removeButton.click( self.removeImage );

			button.click( function(e) {
				e.preventDefault();
				CMB_Frame.open();
			} );

			CMB_Frame.on( 'select', function() {

				var selection = CMB_Frame.state().get('selection'),
					model     = selection.first();

				self.model.set( 'value', model.id );

				self.addImage( model.id );

				CMB_Frame.close();

			});

		}

	} );

} )( jQuery );
