var Backbone = require('backbone'),
	$ = require('jquery'),
    wp = require('wp'),
    sui = require('sui-utils/sui'),
    Shortcodes = require('sui-collections/shortcodes');

var MediaController = wp.media.controller.State.extend({

	initialize: function(){

		this.props = new Backbone.Model({
			currentShortcode: null,
			action: 'select',
			search: null
		});

		this.props.on( 'change:action', this.refresh, this );

	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	search: function( searchTerm ) {
		var pattern = new RegExp( searchTerm, "gi" );
		var filteredModels = sui.shortcodes.filter( function( model ) {
			pattern.lastIndex = 0;
			return pattern.test( model.get( "label" ) );
		});
		return filteredModels;
	},

	insert: function() {
		var self = this;
		var shortcode = this.props.get('currentShortcode');
		var okToInsert$ = $.Deferred();

		/*
		 * Filter run before a shortcode is sent to the editor. Can be used for
		 * client-side validation before closing the media modal.
		 *
		 * Called as `shortcode_ui.send_to_editor`.
		 *
		 *
		 *
		 * @param $.Deferred A promise which is expected to either resolve if
		 *                   the shortcode can be sent to the editor, or reject
		 *                   if not.
		 * @param Shortcode  The current shortcode model.
		 */
		var sendToEditor$ = wp.shortcake.hooks.applyFilters( 'shortcode-ui.send_to_editor', okToInsert$, shortcode );

		// Unless a filter has ch, resolve the promise, sending the shortcode to the editor.
		setTimeout( function() { okToInsert$.resolve(true); } );

		sendToEditor$.then(
			function() {
				send_to_editor( shortcode.formatShortcode() );
				self.reset();
				self.frame.close();
			}
		);
	},

	reset: function() {
		this.props.set( 'action', 'select' );
		this.props.set( 'currentShortcode', null );
		this.props.set( 'search', null );
	},

});

sui.controllers.MediaController = MediaController;
module.exports = MediaController;
