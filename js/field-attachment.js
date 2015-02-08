( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cache attachment IDs for quicker loading.
	var iDCache = {};

	sui.views.editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

		render: function() {

			this.$el.html( this.template( this.model.toJSON() ) );

			var model         = this.model;
			var $container    = this.$el.find( '.shortcake-attachment-field-preview' );
			var $addButton    = $container.find( 'button.add' );
			var $removeButton = $container.find( 'button.remove' );

			var frame = wp.media( {
				multiple: false,
				title: 'Select File',
				// library: frameLibraryType,
			} );

			/**
			 * Update the field attachment.
			 * Re-renders UI.
			 * If ID is empty - does nothing.
			 *
			 * @param {int} id Attachment ID
			 */
			var updateAttachment = function( id ) {

				if ( ! id ) {
					return;
				}

				model.set( 'value', id );

				if ( iDCache[ id ] ) {
					renderPreview( iDCache[ id ] );
					return;
				}

				wp.ajax.post( 'get-attachment', {
					'id': id
				} ).done( function( attachment ) {
					// Cache for later.
					iDCache[ id ] = attachment;
					renderPreview( attachment );
				} );

			}

			/**
			 * Renders attachment preview in field.
			 * @param {object} attachment model
			 * @return null
			 */
			var renderPreview = function( attachment ) {

				$( '<img/>', {
					src:    attachment.sizes.thumbnail.url,
					width:  attachment.sizes.thumbnail.width,
					height: attachment.sizes.thumbnail.height,
					title:  attachment.title,
					alt:    attachment.alt,
				} ).appendTo( $container );

				$container.toggleClass( 'has-attachment', true );

			}

			/**
			 * Remove the attachment.
			 * Render preview & Update the model.
			 */
			var removeAttachment = function() {

				model.set( 'value', null );

				$container.toggleClass( 'has-attachment', false );
				$container.toggleClass( 'has-attachment', false );
				$container.find( 'img' ).remove();
			}

			// Add initial Attachment if available.
			updateAttachment( model.get( 'value' ) );

			// Remove file when the button is clicked.
			$removeButton.click( function(e) {
				e.preventDefault();
				removeAttachment();
			});

			// Open media frame when add button is clicked
			$addButton.click( function(e) {
				e.preventDefault();
				frame.open();
			} );

			// Update the attachment when an item is selected.
			frame.on( 'select', function() {

				var selection  = frame.state().get('selection');
				    attachment = selection.first();

				updateAttachment( attachment.id );

				frame.close();

			});

		}

	} );

} )( jQuery );
