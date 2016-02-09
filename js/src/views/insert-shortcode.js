var sui = require('sui-utils/sui'),
	Shortcodes = require('sui-collections/shortcodes'),
	wp = require('wp'),
	$ = require('jquery'),
	InsertShortcodeList = require('sui-views/insert-shortcode-list');
	EditShortcodeForm = require('sui-views/edit-shortcode-form');

var insertShortcode = wp.Backbone.View.extend({

	shortcodes: [],
	currentShortcode: {},
	state: 'select',

	events: {
		'click .shortcode-list-item': 'editShortcode',
		'click .edit-shortcode-form-cancel': 'selectShortcode',
	},

	initialize : function( options ) {

		if ( 'shortcodes' in options ) {
			this.shortcodes = options.shortcodes;
		} else {
			this.shortcodes = new Shortcodes();
		}

		if ( 'state' in options ) {
			this.state = options.state;
		}

	},

	render: function() {

		_.each( this.views.all(), function( view ) {
			view.remove();
		} );

		if ( 'edit' === this.state ) {
			this.views.add( new EditShortcodeForm({ model: this.currentShortcode }) );
		} else {
			this.views.add( new InsertShortcodeList({ shortcodes: this.shortcodes }) );
		}

		return this;

	},

	editShortcode: function( e ) {
		this.state = 'edit';
		this.currentShortcode = sui.shortcodes.findWhere( { shortcode_tag: e.currentTarget.getAttribute( 'data-shortcode' ) } ).clone();
		this.render();
	},

	selectShortcode: function() {
		this.state = 'select';
		this.currentShortcode = null;
		this.render();
	}

	// refresh: function() {

	// }

	// var list = new insertShortcodeList( { shortcodes: sui.shortcodes.toJSON() } );

	// list.render().$el.appendTo( $container );

	// $( '.shortcode-list-item', list.$el ).click( function() {

	// 	var shortcode = sui.shortcodes.findWhere( { shortcode_tag: $(this).attr( 'data-shortcode' ) } );
	// 	var view = new EditShortcodeForm({ model: shortcode });
	// 	list.remove();
	// 	$container.append( view.render().el );

	// 	$( '.edit-shortcode-form-cancel' ).click( function() {
	// 		view.remove();
	// 		list.$el.appendTo( $container );
	// 	} );

	// });


});

module.exports = insertShortcode;
