var sui = require('sui-utils/sui'),
	wp = require('wp'),
	$ = require('jquery'),
	Shortcodes = require('sui-collections/shortcodes'),
	InsertShortcodeList = require('sui-views/insert-shortcode-list'),
	EditShortcodeForm = require('sui-views/edit-shortcode-form');

var insertShortcode = wp.Backbone.View.extend({

	template : wp.template('shortcode-ui'),

	// Available shortcodes collection.
	shortcodes: [],

	// Currently active shortcode.
	shortcode:  null,

	state:      'select',

	events: {
		'click .shortcode-list-item': 'selectShortcode',
		'click .edit-shortcode-form-cancel': 'clearShortcode',
		'keyup input[name=shortcode-list-search]': 'searchShortcodeList',
	},

	initialize : function( options ) {

		if ( 'shortcodes' in options ) {
			this.shortcodes = options.shortcodes;
		} else {
			this.shortcodes = new Shortcodes();
		}

		if ( 'shortcode' in options ) {
			this.shortcode = options.shortcode;
		}

	},

	prepare: function() {
		return {
			shortcode: this.shortcode,
			shortcodes: this.shortcodes,
		};
	},

	render: function() {

		wp.Backbone.View.prototype.render.apply( this, arguments );

		_.each( this.views.get( '.content' ), function( view ) {
			view.remove();
		} );

		if ( this.shortcode ) {
			this.views.add( '.content', new EditShortcodeForm({ model: this.shortcode }) );
		} else {
			this.views.add( '.content', new InsertShortcodeList({ shortcodes: this.shortcodes }) );
		}

		return this;

	},

	searchShortcodeList: function(e) {

		var s = e.target.value;
		var listView = this.views.first( '.content' );

		if ( s.length ) {

			var pattern = new RegExp( s, "i" );

			var filtered = this.shortcodes.filter( function( model ) {
				return pattern.test( model.get( "label" ) );
			});

			listView.refresh( filtered );

		} else {

			listView.refresh( this.shortcodes );

		}

	},

	/**
	 * Handler for selecting shortcode.
	 * Set this.shortcode and re-render.
	 */
	selectShortcode: function( e ) {

		this.shortcode = sui.shortcodes.findWhere( {
			shortcode_tag: e.currentTarget.getAttribute( 'data-shortcode' )
		} ).clone();

		this.render();
	},

	/**
	 * Handler for cancelling edit shortcode.
	 * Clear shortcode and re-render.
	 */
	clearShortcode: function() {
		this.shortcode = null;
		this.render();
	}

});

module.exports = insertShortcode;
