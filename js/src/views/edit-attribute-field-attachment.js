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
	updateValue: function( id ) {

		if ( ! id ) {
			return;
		}

		this.setValue( id );

		var self = this;

		if ( editAttributeFieldAttachment.getFromCache( id ) ) {
			self._renderPreview( editAttributeFieldAttachment.getFromCache( id ) );

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
			return;
		}

		this.$container.addClass( 'loading' );

		wp.ajax.post( 'get-attachment', {
			'id': id
		} ).done( function( attachment ) {
			// Cache for later.
			editAttributeFieldAttachment.setInCache( id, attachment );
			self._renderPreview( attachment );

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
		} ).always( function( attachment ) {
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

		this.$container   = this.$el.find( '.shortcake-attachment-preview' );
		this.$thumbnailDetailsContainer   = this.$el.find( '.thumbnail-details-container' );
		var $addButton    = this.$container.find( 'button.add' );

		this.frame = wp.media( {
			multiple: false,
			title: this.model.get( 'frameTitle' ),
			library: {
				type: this.model.get( 'libraryType' ),
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
			} ) .appendTo( $thumbnail );

		}

		$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );
		this.$container.append( $thumbnail );
		this.$container.toggleClass( 'has-attachment', true );

		this.$thumbnailDetailsContainer.find( '.filename' ).text( attachment.filename );
		this.$thumbnailDetailsContainer.find( '.date-formatted' ).text( attachment.dateFormatted );
		this.$thumbnailDetailsContainer.find( '.size' ).text( attachment.filesizeHumanReadable );
		this.$thumbnailDetailsContainer.find( '.dimensions' ).text( attachment.height + ' × ' + attachment.width );
		this.$thumbnailDetailsContainer.find( '.edit-link a' ).attr( "href", attachment.editLink );
		this.$thumbnailDetailsContainer.toggleClass( 'has-attachment', true );

	},

	/**
	 * Open media frame when add button is clicked.
	 *
	 */
	_openMediaFrame: function(e) {
		e.preventDefault();
		this.frame.open();
		if ( this.model.get( 'value' ) ) {
			var selection = this.frame.state().get('selection');
			attachment = wp.media.attachment( this.model.get( 'value' ) );
			attachment.fetch();
			selection.reset( attachment ? [ attachment ] : [] );
			this.frame.state().set('selection', selection);
		}

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
		var selection  = this.frame.state().get('selection');
			attachment = selection.first();
		if ( attachment.id != this.model.get( 'value' ) ){
			this.model.set( 'value', null );
			this.$container.toggleClass( 'has-attachment', false );
			this.$container.find( '.thumbnail' ).remove();
			this.updateValue( attachment.id );
		}
		this.frame.close();
	},

	/**
	 * Remove the attachment.
	 * Render preview & Update the model.
	 */
	_removeAttachment: function(e) {
		e.preventDefault();

		this.model.set( 'value', null );

		this.$container.toggleClass( 'has-attachment', false );
		this.$container.find( '.thumbnail' ).remove();
		this.$thumbnailDetailsContainer.toggleClass( 'has-attachment', false );
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

