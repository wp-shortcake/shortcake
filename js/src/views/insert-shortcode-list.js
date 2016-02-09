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
	refresh: function( shortcodeData ) {

		var options;

		// Remove existing views.
		this.views.get('ul').each( function( view ) {
			view.remove();
		} );

		if ( shortcodeData instanceof Backbone.Collection ) {
			this.options.shortcodes = shortcodeData;
		} else {
			this.options.shortcodes = new Shortcodes( shortcodeData );
		}

		this.renderShortcodeListItems( options );

	},

	/**
	 * Add subviews for all shortcodes.
	 */
	renderShortcodeListItems: function() {

		console.log( 1, this.options.shortcodes.length );

		this.options.shortcodes.each( function( shortcode ) {
			this.views.add( 'ul', new insertShortcodeListItem({
				model : shortcode
			}));
		}.bind(this) );
	}

});

module.exports = insertShortcodeList;
