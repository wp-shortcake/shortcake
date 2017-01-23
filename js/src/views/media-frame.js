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

		this.mediaController = new MediaController({
			id       : id,
			search   : true,
			router   : false,
			toolbar  : id + '-toolbar',
			menu     : 'default',
			title    : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs     : [ 'insert' ],
			priority :  66,
			content  : id + '-content-insert',
		});

		if ( 'currentShortcode' in this.options ) {
			this.mediaController.setActionUpdate( this.options.currentShortcode );
		}

		this.states.add([ this.mediaController ]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	events: function() {
		return _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item' : 'resetMediaController',
		} );
	},

	resetMediaController: function( event ) {
		if ( this.state() && 'undefined' !== typeof this.state().props && this.state().props.get('currentShortcode') ) {
			this.mediaController.reset();
			this.contentRender( 'shortcode-ui', 'insert' );
		}
	},

	contentRender : function( id, tab ) {
		this.content.set(
			new Shortcode_UI( {
				controller: this,
				className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
			} )
		);
	},

	toolbarCreate : function( toolbar ) {

		var text = shortcodeUIData.strings.media_frame_toolbar_insert_label;

		if ( this.state().props.get('currentShortcode') ) {
			text = shortcodeUIData.strings.media_frame_toolbar_update_label;
		}

		toolbar.view = new Toolbar( {
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
