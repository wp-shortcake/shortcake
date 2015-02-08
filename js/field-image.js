( function( $ ) {

	var sui = window.Shortcode_UI;

	sui.views.editAttributeFieldImage = sui.views.editAttributeField.extend( {

		render: function() {

			this.$el.html( this.template( this.model.toJSON() ) );

			var model         = this.model;
			var $container    = this.$el.find( '.shortcake-image-field-preview' );
			var $addButton    = $container.find( 'button.add' );
			var $removeButton = $container.find( 'button.remove' );

			var frame = wp.media( {
				multiple: false,
				title: 'Select File',
				// library: frameLibraryType,
			} );

			/**
			 * Add the image.
			 * If ID is empty - does nothing.
			 * @param {int} id Attachment ID
			 */
			var addImage = function( id ) {

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

			/**
			 * Remove the image.
			 */
			var removeImage = function() {
				$container.toggleClass( 'has-img', false );
				$container.find( 'img' ).remove();
			}

			// Maybe add Image
			addImage( model.get( 'value' ) );

			// Remove Image
			$removeButton.click( function(e) {
				e.preventDefault();
				removeImage();
			});

			// Open media frame
			$addButton.click( function(e) {
				e.preventDefault();
				frame.open();
			} );

			frame.on( 'select', function() {

				var selection = frame.state().get('selection');

				model.set( 'value', selection.first().id );
				addImage( model.id );

				frame.close();

			});

		}

	} );

} )( jQuery );
