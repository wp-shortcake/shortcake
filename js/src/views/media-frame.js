var wp = require('wp'),
	$ = require('jquery'),
	sui = require('sui-utils/sui'),
	MediaController = require('sui-controllers/media-controller'),
	Shortcode_UI = require('./shortcode-ui'),
	Toolbar = require('./media-toolbar'),
	SearchShortcode = require('sui-views/search-shortcode'),
	InsertShortcodeList = require('sui-views/insert-shortcode-list');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

	shortcode_UI: null,

	initialize: function() {

		postMediaFrame.prototype.initialize.apply( this, arguments );

		var id = 'shortcode-ui';

		var opts = {
			id      : id,
			search  : true,
			router  : false,
			toolbar : id + '-toolbar',
			menu    : 'default',
			title   : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs    : [ 'insert' ],
			priority:  66,
			content : id + '-content-insert',
		};

		if ( 'shortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace( /%s/, this.options.shortcode.attributes.label );
		}

		this.mediaController = new MediaController( opts );

		if ( 'shortcode' in this.options ) {
			this.mediaController.props.set( 'shortcode', arguments[0].shortcode );
		}

		this.states.add([ this.mediaController ]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	events: function() {
		return _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item': 'resetMediaController',
		} );
	},

	resetMediaController: function( event ) {
		if ( this.state() && 'undefined' !== typeof this.state().props && this.state().props.get('shortcode') ) {
			this.mediaController.reset();

		}
	},

	contentRender : function( id, tab ) {

		this.shortcode_UI = new Shortcode_UI({
			shortcodes: sui.shortcodes
		});

		this.shortcode_UI.$el.addClass( 'clearfix' );
		this.shortcode_UI.$el.addClass( id + '-content' );
		this.shortcode_UI.$el.addClass( id + '-content-' + tab );

		this.content.set( this.shortcode_UI );

		// this.content.set(
		// 	new Shortcode_UI( {
		// 		controller: this,
		// 		className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
		// 	} )
		// );
	},

	toolbarCreate : function( toolbar ) {

		var text = shortcodeUIData.strings.media_frame_toolbar_insert_label;
		if ( 'shortcode' in this.options ) {
			text = shortcodeUIData.strings.media_frame_toolbar_update_label;
		}

		toolbar.view = new  Toolbar( {
			controller : this,
			items: {
				insert: {
					text: text,
					style: 'primary',
					priority: 80,
					requires: false,
					click: this.insertAction,
				}
			}
		} );
	},

	renderShortcodeUIMenu: function( view ) {

		// Add a menu separator link.
		view.set({
			'shortcode-ui-separator': new wp.media.View({
				className: 'separator',
				priority: 65
			})
		});

		// Hide menu if editing.
		// @todo - fix this.
		// This is a hack.
		// I just can't work out how to do it properly...
		if ( view.controller.state().props && view.controller.state().props.get( 'shortcode' ) ) {
			window.setTimeout( function() {
				view.controller.$el.addClass( 'hide-menu' );
			} );
		}

	},

	insertAction: function() {
		this.controller.state().insert();
	},

} );

module.exports = mediaFrame;
