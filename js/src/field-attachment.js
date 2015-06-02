var sui = require('sui-utils/sui'),
    editAttributeField = require( 'sui-views/edit-attribute-field' ),
    $ = require('jquery');

// Cache attachment IDs for quicker loading.
var iDCache = {};

sui.views.editAttributeFieldAttachment = editAttributeField.extend( {

	render: function() {

		var model = this.model;

		// Set model default values.
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! model.get( arg ) ) {
				model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( model.toJSON() ) );

		var $container    = this.$el.find( '.shortcake-attachment-preview' );
		var $addButton    = $container.find( 'button.add' );
		var $removeButton = $container.find( 'button.remove' );

		var frame = wp.media( {
			multiple: false,
			title: model.get( 'frameTitle' ),
			library: {
				type: model.get( 'libraryType' ),
			},
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

			$container.addClass( 'loading' );

			wp.ajax.post( 'get-attachment', {
				'id': id
			} ).done( function( attachment ) {
				// Cache for later.
				iDCache[ id ] = attachment;
				renderPreview( attachment );
				$container.removeClass( 'loading' );
			} );

		}

		/**
		 * Renders attachment preview in field.
		 * @param {object} attachment model
		 * @return null
		 */
		var renderPreview = function( attachment ) {

			var $thumbnail = $('<div class="thumbnail"></div>');

			if ( 'image' !== attachment.type ) {

				$( '<img/>', {
					src: attachment.icon,
					alt: attachment.title,
				} ).appendTo( $thumbnail );

				$( '<div/>', {
					class: 'filename',
					html:  '<div>' + attachment.title + '</div>',
				} ).appendTo( $thumbnail );

			} else {

				attachmentThumb = (typeof attachment.sizes.thumbnail !== 'undefined') ?
					attachment.sizes.thumbnail :
					_.first( _.sortBy( attachment.sizes, 'width' ) );

				$( '<img/>', {
					src:    attachmentThumb.url,
					width:  attachmentThumb.width,
					height: attachmentThumb.height,
					alt:    attachment.alt,
				} ) .appendTo( $thumbnail )

			}

			$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );
			$container.append( $thumbnail );
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
			$container.find( '.thumbnail' ).remove();
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
