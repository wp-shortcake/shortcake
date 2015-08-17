var sui = require('sui-utils/sui');

var editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

	events: {
		'click .add'       : '_openMediaFrame',
		'click .remove'    : '_removeAttachment',
		'click .thumbnail' : '_openMediaFrame',
		'selectAttachment' : '_selectAttachment',
	},

	/**
	 * Update the field attachment.
	 * Re-renders UI.
	 * If ID is empty - does nothing.
	 *
	 * @param {int} id Attachment ID
	 */
	updateValue: function( ids ) {

		if ( ! ids ) {
			return;
		}

		this.setValue( ids );

		var self = this,
			ids = ids.split(', '),		
			nonCached = [];

		jQuery.each( ids, function(index, id) {

			if ( editAttributeFieldAttachment.getFromCache( id ) ) {
				self._renderPreview( editAttributeFieldAttachment.getFromCache( id ) );
				return;
				// Call the updateValue() function, to trigger any listeners
				// hooked on it.
				self.triggerCallbacks();
			} else {
				nonCached.push(id);
			}
		})

		if ( nonCached.length == 0 ) {
			return;
		}
	
		this.$container.addClass( 'loading' );

		query = {
			'post_mime_type' : 'image',
			'post__in' : nonCached
		};

		wp.ajax.post( 'query-attachments', {
			'query': query
		} ).done( function( attachments ) {
			// Fetch non-cached data
			jQuery.each( attachments, function( index, attachment ) {
				console.log('FETCH: ', attachment.id, typeof(attachment.id));
				// Cache for later.
				editAttributeFieldAttachment.setInCache( attachment.id, attachment );
				self._renderPreview( attachment );
			})			

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
		} ).always( function( attachments ) {
			self.$container.removeClass( 'loading' );
		});
	},

	render: function() {

		// Set model default values.
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! this.model.get( arg ) ) {
				this.model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( this.model.toJSON() ) );

		this.$container = this.$el.find( '.shortcake-attachments' );
		var $addButton = this.$container.find( 'button.add' );

		this.mediaFrameQuery = {
			'post_mime_type' : 'image',
			'post__not_in' : this.model.get( 'value' )
		};

		this.frame = wp.media( {
			multiple: this.model.get( 'multiple' ),
			title: this.model.get( 'frameTitle' ),
			query: this.mediaFrameQuery,
			library: {
				type: this.model.get( 'libraryType' ),
			},
			button: {
				text: 'Add Image',
			},
		} );

 		// Add initial Attachment if available.
		this.updateValue( this.model.get( 'value' ) );

	},

	/**
	 * Renders attachment preview in field.
	 * @param {object} attachment model
	 * @return null
	 */
	_renderPreview: function( attachment ) {

		var $node = this.$container.find( 'li.attachment:not(.has-attachment)' ).clone();
		var $thumbnailPreviewContainer = $node.find('.shortcake-attachment-preview');
		var $thumbnailDetailsContainer = $node.find('.thumbnail-details-container');
		var $thumbnail = jQuery('<div class="thumbnail"></div>');

		if ( 'image' !== attachment.type ) {

			jQuery( '<img/>', {
				src: attachment.icon,
				alt: attachment.title,
			} ).appendTo( $thumbnail );

			jQuery( '<div/>', {
				class: 'filename',
				html:  '<div>' + attachment.title + '</div>',
			} ).appendTo( $thumbnail );

		} else {

			attachmentThumb = (typeof attachment.sizes.thumbnail !== 'undefined') ?
				attachment.sizes.thumbnail :
				_.first( _.sortBy( attachment.sizes, 'width' ) );

			jQuery( '<img/>', {
				src:    attachmentThumb.url,
				width:  attachmentThumb.width,
				height: attachmentThumb.height,
				alt:    attachment.alt,
			} ) .appendTo( $thumbnail )

		}

		$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );

		$thumbnailPreviewContainer.append($thumbnail);
		$thumbnailPreviewContainer.toggleClass( 'has-attachment', true );		

		$thumbnailDetailsContainer.find( '.filename' ).text( attachment.filename );
		$thumbnailDetailsContainer.find( '.date-formatted' ).text( attachment.dateFormatted );
		$thumbnailDetailsContainer.find( '.size' ).text( attachment.filesizeHumanReadable );
		$thumbnailDetailsContainer.find( '.dimensions' ).text( attachment.height + ' × ' + attachment.width );
		$thumbnailDetailsContainer.find( '.edit-link a' ).attr( "href", attachment.editLink );
		$thumbnailDetailsContainer.toggleClass( 'has-attachment', true );

		$node.attr('data-attachment-id', attachment.id);
		$node.toggleClass( 'has-attachment', true );

		this.$container.prepend( $node );
	},

	/**
	 * Open media frame when add button is clicked.
	 *
	 */
	_openMediaFrame: function(e) {
		e.preventDefault();
		this.frame.open();

		var self = this;
		this.frame.on( 'select', function() {
			self.$el.trigger( 'selectAttachment'  );
		} );

	},

	/**
	 * When an attachment is selected from the media frame, update the model value.
	 *
	 */
	_selectAttachment: function(e) {
		var selection = this.frame.state().get('selection');
		var selected  = null;

		if ( ! this.model.get( 'multiple' ) ) {
			selected = selection.first().get('id');
			selected = selected.toString();
		} else {
			selected  = [];
			selection.map( function( attachment ) {
			    attachment = attachment.toJSON();
			    selected.push(attachment.id);
			});
			
			if (this.model.get( 'value' )) {
				current  = this.model.get( 'value' ).split(', ');
				selected = _.union(selected, current);		
			}			

			selected = selected.join(', ');
		}

		if ( selected != this.model.get( 'value' ) ){
			this.model.set( 'value', null );
			this.$container.toggleClass( 'has-attachment', false );
			this.$container.find( 'li.has-attachment' ).remove();
			this.updateValue( selected );
		}
		this.frame.close();
	},

	/**
	 * Remove the attachment.
	 * Render preview & Update the model.
	 */
	_removeAttachment: function(e) {
		e.preventDefault();

		var $attachment = jQuery(e.target).parents('li.attachment'),
		    $id = $attachment.attr('data-attachment-id');
			$attachmentIds = this.model.get( 'value' ).split(', ');

		index = $attachmentIds.indexOf($id);

		if (index > -1) {
		    $attachmentIds.splice(index, 1);
		}

		if ( $attachmentIds.length > 0 ) {
			this.setValue( $attachmentIds.join(', ') );
		} else {
			this.model.set( 'value', null );
		}

		$attachment.find('.has-attachment').toggleClass( 'has-attachment', false );
		$attachment.remove();
	},

}, {

	_idCache: {},

	/**
	 * Store attachments in a cache for quicker loading.
	 */
	setInCache: function( id, attachment ) {
		this._idCache[ id ] = attachment;
	},

	/**
	 * Retrieve an attachment from the cache.
	 */
	getFromCache: function( id ){
		if ( 'undefined' === typeof this._idCache[ id ] ) {
			return false;
		}
		return this._idCache[ id ];
	},

});

module.exports = sui.views.editAttributeFieldAttachment = editAttributeFieldAttachment;

