var sui = require('sui-utils/sui');
var $   = require('jquery');

var editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

	previewTemplate: wp.template( 'shortcake-image-preview' ),

	events: {
		'click .add'       : '_openMediaFrame',
		'click .remove'    : '_removeAttachment',
		'click .thumbnail' : '_openMediaFrame',
		'selectAttachment' : '_selectAttachment',
	},

	currentSelection: [],

	initialize: function() {

		var self = this;

		_.bindAll( self, 'updateValue', 'initSelection', '_renderPreview', '_renderAll', '_removeAttachment' );

		self.initSelection();

		self.currentSelection.on( 'all', this.updateValue );
		self.currentSelection.on( 'add', this._renderPreview );
		self.currentSelection.on( 'reset', this._renderAll );

	},

	/**
	 * Initialize Selection.
	 *
	 * Selection is an Attachment collection containing full models for the current value.
	 *
	 * @return null
	 */
	initSelection: function() {

		this.currentSelection = new wp.media.model.Selection( [], {
			multiple: this.model.get( 'multiple' ) ? true : false,
		} );

		// Initialize selection.
		_.each( this.getValue(), function( item ) {

			var model;

			// Legacy. Handle storing full objects.
			item  = ( 'object' === typeof( item ) ) ? item.id : item;
			model = new wp.media.attachment( item );

			this.currentSelection.add( model );

			// Re-render after attachments have synced.
			model.fetch();
			model.on( 'sync', this._renderAll );

		}.bind(this) );

	},

	/**
	 * Update the field attachment.
	 * Re-renders UI.
	 * If ID is empty - does nothing.
	 *
	 * @param {int} id Attachment ID
	 */
	updateValue: function() {
		var value = this.currentSelection.pluck( 'id' );
		this.setValue( value );
		this.triggerCallbacks();
	},

	render: function() {

		// Set model default values.
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! this.model.get( arg ) ) {
				this.model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( this.model.toJSON() ) );

		this.$container = this.$el.find( '.attachment-previews' );
		this.$thumbnailDetailsContainer   = this.$el.find( '.thumbnail-details-container' );
		var $addButton = this.$container.find( 'button.add' );

		this.frame = wp.media( {
			multiple: this.model.get( 'multiple' ) ? true : false,
			title:    this.model.get( 'frameTitle' ),
			library: {
				type: this.model.get( 'libraryType' ),
			},
		} );

		this.frame.on( 'select', function() {
			this.$el.trigger( 'selectAttachment' );
		}.bind( this ) );

		this._renderAll();

        this.triggerCallbacks();

	},

	_renderAll: function() {

		// Empty container.
		this.$container.html('');

		// Render each attachment in current selection.
		this.currentSelection.each( function( attachment ) {
			this._renderPreview( attachment );
		}.bind(this) );

	},

	/**
	 * Renders attachment preview in field.
	 * @param {object} attachment model
	 * @return null
	 */
	_renderPreview: function( attachment ) {

		var $thumbnail = $( this.previewTemplate( attachment.toJSON() ) );

		$thumbnail.appendTo( this.$container );

		attachment.on( 'remove', function() {
			$thumbnail.remove();
		} );

	},

	getValue: function() {

		var value = this.model.get( 'value' );

		if ( ! ( value instanceof Array ) ) {
			value = value.split( ',' );
		}

		value = value.map( function( id ) {
			return parseInt( id, 10 );
		} );

		value = value.filter( function( id ) {
			return id > 0;
		} );

		value.sort( function( a, b ) {
			return a < b;
		} );

		return value;

	},

	/**
	 * Open media frame when add button is clicked.
	 *
	 */
	_openMediaFrame: function(e) {

		e.preventDefault();
		this.frame.open();

		var selection = this.frame.state().get('selection');
		selection.reset( this.currentSelection.models );
		this.frame.state('library').set( 'selection', selection );

	},

	/**
	 * When an attachment is selected from the media frame, update the model value.
	 *
	 */
	_selectAttachment: function(e) {

		var selection  = this.frame.state().get('selection');
		this.currentSelection.reset( selection.toJSON() );

		this.frame.close();

	},

	/**
	 * Remove the attachment.
	 * Render preview & Update the model.
	 */
	_removeAttachment: function(e) {

		e.preventDefault();

		var id = $( e.target ).attr( 'data-id' );

		if ( ! id ) {
			return;
		}

		var target = this.currentSelection.get( id );

		if ( target ) {
			this.currentSelection.remove( target );
		}

	},

});

module.exports = sui.views.editAttributeFieldAttachment = editAttributeFieldAttachment;

