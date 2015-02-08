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

				if ( ! id ) {
					return;
				}

				wp.ajax.post( 'get-attachment', {
					'id': id
				} ).done( function( attachment ) {

					$( '<img/>', {
						src:    attachment.sizes.thumbnail.url,
						width:  attachment.sizes.thumbnail.width,
						height: attachment.sizes.thumbnail.height,
						title:  attachment.title,
						alt:    attachment.alt,
					} ).appendTo( $container );

					$container.toggleClass( 'has-img', true );

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
