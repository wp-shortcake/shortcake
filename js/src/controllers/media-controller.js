var Backbone = require('backbone'),
    wp = require('wp'),
    sui = require('sui-utils/sui'),
    Shortcodes = require('sui-collections/shortcodes');

var MediaController = wp.media.controller.State.extend({

	initialize: function(){

		this.props = new Backbone.Model({
			shortcode: null,
			action: 'select',
			search: null
		});

	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	insert: function() {
		var shortcode = this.props.get('shortcode');
		if ( shortcode ) {
			send_to_editor( shortcode.formatShortcode() );
			this.reset();
			this.frame.close();
		}
	},

	reset: function() {
		this.props.set( 'shortcode', null );
		this.props.set( 'search', null );
	},

});

sui.controllers.MediaController = MediaController;
module.exports = MediaController;
