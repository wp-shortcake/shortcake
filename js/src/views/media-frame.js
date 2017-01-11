var wp = require('wp'),
	$ = require('jquery'),
	MediaController = require('sui-controllers/media-controller'),
	Shortcode_UI = require('./shortcode-ui'),
	Toolbar = require('./media-toolbar');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

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

		if ( 'currentShortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace( /%s/, this.options.currentShortcode.attributes.label );
		}

		if ( this.frame ) {
			this.frame.dispose();
		}

		this.mediaController = new MediaController( opts );

		console.log( arguments, this.options, this.mediaController );

		if ( 'currentShortcode' in arguments[0] ) {
			this.mediaController.props.set( 'currentShortcode', this.options.currentShortcode );
			this.mediaController.props.set( 'action', 'update' );
		} else {
			this.mediaController.props.unset( 'currentShortcode' );
			this.mediaController.props.set( 'action', 'insert' );
			this.mediaController.reset();
		}

		this.states.add([ this.mediaController ]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	events: function() {
		return _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item'    : 'resetMediaController',
		} );
	},

	resetMediaController: function( event ) {
		if ( this.state() && 'undefined' !== typeof this.state().props && this.state().props.get('currentShortcode') ) {
			this.mediaController.reset();
			this.contentRender( 'shortcode-ui', 'insert' );
		}
	},

	reset: function() {
		if ( 'currentShortcode' in this.options ) {
			delete this.options.currentShortcode;
		}

		this.options.title = shortcodeUIData.strings.media_frame_menu_insert_label;
		this.resetMediaController();
		console.log( this );
		//this.contentRender( 'shortcode-ui', 'insert' );
		//this.renderShortcodeUIMenu();
	},

	contentRender : function( id, tab ) {
		this.content.set(
			new Shortcode_UI( {
				controller: this,
				className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
			} )
		);
	},

	toolbarRender: function( toolbar ) {},

	toolbarCreate : function( toolbar ) {
		var text = shortcodeUIData.strings.media_frame_toolbar_insert_label;
		if ( 'currentShortcode' in this.options ) {
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
		if ( view.controller.state().props && view.controller.state().props.get( 'currentShortcode' ) ) {
			window.setTimeout( function() {
				view.controller.$el.addClass( 'hide-menu' );
			} );
		}

	},

	insertAction: function() {
		/* Trigger render_destroy */
		/*
		 * Action run before the shortcode overlay is destroyed.
		 *
		 * Called as `shortcode-ui.render_destroy`.
		 *
		 * @param shortcodeModel (object)
		 *           Reference to the shortcode model used in this overlay.
		 */
		var hookName = 'shortcode-ui.render_destroy';
		var shortcodeModel = this.controller.state().props.get( 'currentShortcode' );
		wp.shortcake.hooks.doAction( hookName, shortcodeModel );

		this.controller.state().insert();

	},

} );

module.exports = mediaFrame;
