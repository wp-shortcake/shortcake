var $ = require('jquery');
var wp = require('wp');
var Backbone = require('backbone');
var Shortcodes = require('sui-collections/shortcodes');
var insertShortcodeListItem = require('sui-views/insert-shortcode-list-item');

var insertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	className : 'insert-shortcode-list',
	template : wp.template('add-shortcode-list'),

	initialize : function( options ) {
		this.setShortcodes( ( 'shortcodes' in options ) ? options.shortcodes : [] );
		this.refresh();
	},

	/**
	 * Set / Update shortcodes list.
	 */
	setShortcodes: function( shortcodes ) {

		if ( shortcodes instanceof Shortcodes ) {
			this.shortcodes = shortcodes;
		} else if ( Array.isArray( shortcodes ) ) {
			this.shortcodes = new Shortcodes( shortcodes );
		} else {
			this.shortcodes = new Shortcodes();
		}

	},

	/**
	 * Refresh & render shortcodes and sub-views.
	 */
	refresh: function( shortcodes ) {

		shortcodes = shortcodes || this.shortcodes;

		// Remove existing views.
		_.each( this.views.get('ul'), function( view ) {
			view.remove();
		} );

		shortcodes.each( function( shortcode ) {
			this.views.add( 'ul', new insertShortcodeListItem({
				model : shortcode
			}));
		}.bind(this) );

	},

	search: function( s ) {

		if ( s && s.length ) {

			var pattern = new RegExp( s, "i" );

			var filteredShortcodes = this.shortcodes.filter( function( shortcode ) {
				return pattern.test( shortcode.get( "label" ) );
			});

			this.refresh( new Shortcodes( filteredShortcodes ) );

		} else {

			this.refresh();

		}

	},

});

module.exports = insertShortcodeList;
