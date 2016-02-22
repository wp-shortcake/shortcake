var $ = require('jquery');
var wp = require('wp');
var Backbone = require('backbone');
var Shortcodes = require('sui-collections/shortcodes');
var insertShortcodeListItem = require('sui-views/insert-shortcode-list-item');

var insertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function( options ) {

		var shortcodes = [];

		if ( ! ( 'shortcodes' in options && options.shortcodes instanceof Shortcodes ) ) {

			if ( options.shortcodes && Array.isArray( options.shortcodes ) ) {
				shortcodes = options.shortcodes;
			}

			options.shortcodes = new Shortcodes( shortcodes );

		}

		this.renderShortcodeListItems();

	},

	/**
	 * Refresh shortcodes and sub-views.
	 */
	refresh: function( shortcodes ) {

		// Remove existing views.
		_.each( this.views.get('ul'), function( view ) {
			view.remove();
		} );

		if ( shortcodes instanceof Backbone.Collection ) {
			this.options.shortcodes = shortcodes;
		} else {
			this.options.shortcodes = new Shortcodes( shortcodes );
		}

		this.renderShortcodeListItems();

	},

	// search: function( s ) {

	// 	if ( s.length ) {

	// 		var shortcodes = [];
	// 		// var shortcodes = _.filter( this.options.shortcodes, function() {

	// 		// } );

	// 		this.renderShortcodeListItems( shortcodes );

	// 	} else {

	// 		this.renderShortcodeListItems();

	// 	}

	// },

	/**
	 * Add subviews for all shortcodes.
	 */
	renderShortcodeListItems: function( shortcodes ) {

		shortcodes = shortcodes || this.options.shortcodes;

		shortcodes.each( function( shortcode ) {
			this.views.add( 'ul', new insertShortcodeListItem({
				model : shortcode
			}));
		}.bind(this) );

	}

});

module.exports = insertShortcodeList;
