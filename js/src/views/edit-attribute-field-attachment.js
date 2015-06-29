var sui = require('sui-utils/sui');

var editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

	events: {
		'click .add'       : '_openMediaFrame',
		'click .remove'    : '_removeAttachment',
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

		this.model.set( 'value', id );

		var self = this;

		if ( this._getFromCache( id ) ) {
			self._renderPreview( this._getFromCache( id ) );
			return;

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			this.triggerCallbacks();
		}

		this.$container.addClass( 'loading' );

		wp.ajax.post( 'get-attachment', {
			'id': id
		} ).done( function( attachment ) {
			// Cache for later.
			self._setInCache( id, attachment );
			self._renderPreview( attachment );
			self.$container.removeClass( 'loading' );

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			this.triggerCallbacks();
		} );
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
			} ) .appendTo( $thumbnail )

		}

		$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );
		this.$container.append( $thumbnail );
		this.$container.toggleClass( 'has-attachment', true );

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
		var selection  = this.frame.state().get('selection');
			attachment = selection.first();

		this.updateValue( attachment.id );
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
	},


	/**
	 * Store attachments in a cache for quicker loading.
	 */
	_getFromCache: function( id ){
		this._prepCache();
		if ( 'undefined' === typeof window.sui.data.idCache[ id ] ) {
			return false;
		}
		return window.sui.data.idCache[ id ];
	},

	_setInCache: function( id, attachment ) {
		this._prepCache();
		window.sui.data.idCache[ id ] = attachment;
	},


	/**
	 * Expose a global for the attachement cache.
	 *
	 * This is useful in that plugins which hook into this field's events can
	 * grab data from it.
	 */
	_prepCache: function() {
		window.sui = window.sui || {};
		window.sui.data = window.sui.data || {};
		window.sui.data.idCache = window.sui.data.idCache || {};
	}

} );

module.exports = sui.views.editAttributeFieldAttachment = editAttributeFieldAttachment;

