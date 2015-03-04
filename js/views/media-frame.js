var wp = require('wp'),
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
			router  : false,
			toolbar : id + '-toolbar',
			menu    : 'default',
			title   : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs    : [ 'insert' ],
			priority:  66,
			content : id + '-content-insert',
		};

		if ( 'currentShortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label;
		}

		var controller = new MediaController( opts );

		if ( 'currentShortcode' in this.options ) {
			controller.props.set( 'currentShortcode', arguments[0].currentShortcode );
			controller.props.set( 'action', 'update' );
		}

		this.states.add([ controller]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

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
		if (
			view.controller.state().props
			&& view.controller.state().props.get( 'currentShortcode' )
		) {
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
