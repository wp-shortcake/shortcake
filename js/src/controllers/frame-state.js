var Backbone = require('backbone'),
    wp = require('wp'),
    sui = require('sui-utils/sui'),
    Shortcodes = require('sui-collections/shortcodes');

var FrameState = wp.media.controller.State.extend({

	initialize: function( options ){

		_.bindAll( this, 'refresh', 'insert', 'reset', 'setShortcode', 'getShortcode' );

		this.props = new Backbone.Model({
			shortcode: null,
			search:    null
		});

		if ( 'shortcode' in options ) {
			this.setShortcode( options.shortcode );
		}

		// Allow setting a custom insertAction method.
		if ( 'insertAction' in options ) {
			this.insertAction = options.insertAction;
		}

	},

	insertAction: function( shortcode ) {
		send_to_editor( shortcode.formatShortcode() );
	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	insert: function() {

		var shortcode = this.props.get('shortcode');

		if ( shortcode ) {
			this.insertAction( shortcode );
			this.reset();
			this.frame.close();
		}
	},

	reset: function() {
		this.props.set( 'shortcode', null );
		this.props.set( 'search', null );
	},

	setShortcode: function( shortcode ) {
		this.props.set( 'shortcode', shortcode );
	},

	getShortcode: function( shortcode ) {
		return this.props.get( 'shortcode' );
	},

});

module.exports = FrameState;
