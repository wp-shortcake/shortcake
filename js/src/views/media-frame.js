var wp = require('wp'),
	$ = require('jquery'),
	sui = require('sui-utils/sui'),
	shortcodeUiController = require('sui-controllers/media-controller'),
	Toolbar = require('./media-toolbar'),
	InsertShortcodeList = require('sui-views/insert-shortcode-list'),
	EditShortcodeForm = require('./edit-shortcode-form.js');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

	initialize: function() {

		postMediaFrame.prototype.initialize.apply( this, arguments );

		var mode, opts, controller;

		mode = ( 'shortcode' in this.options ) ? 'edit' : 'browse';

		opts = {
			id        : 'shortcode-ui',
			toolbar   : 'shortcode-ui-toolbar',
			content   : 'shortcode-ui-content-' + mode,
			menu      : 'default',
			search    : true,
			router    : false,
			priority  :  66,
			title     : shortcodeUIData.strings.media_frame_menu_insert_label,
		};

		if ( 'shortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace(
				/%s/,
				this.options.shortcode.attributes.label
			);
		}

		controller = new shortcodeUiController( opts );

		if ( 'shortcode' in this.options ) {
			controller.props.set( 'shortcode', this.options.shortcode );
		}

		this.states.add( controller );

		this.shortcodes = sui.shortcodes;

		_.bindAll( this, 'shortcodeUiSelect', 'shortcodeUiReset' );

		this.on( 'content:create:shortcode-ui-content-browse', this.ShortcodeUiRenderBrowse, this );
		this.on( 'content:render:shortcode-ui-content-edit',   this.ShortcodeUiRenderEdit, this );
		this.on( 'toolbar:create:shortcode-ui-toolbar',        this.ShortcodeUiCreateToolbar, this );
		this.on( 'menu:render:default',                        this.ShortcodeUiRenderMenu, this );

	},

	shortcodeUiInsert: function() {
		this.controller.state().insert();
	},

	shortcodeUiSelect: function( shortcode ) {
		this.state().setShortcode( shortcode.clone() );
		this.content.mode( 'shortcode-ui-content-edit' );
	},

	shortcodeUiReset: function() {
		this.state('shortcode-ui').reset();
		this.content.mode( 'shortcode-ui-content-browse' );
	},

	ShortcodeUiRenderBrowse : function( contentRegion ) {

		var view = new InsertShortcodeList({
			shortcodes: this.shortcodes
		});

		this.content.set( view );

		$( '.media-menu-item', this.$el ).click( this.shortcodeUiReset );
		view.on( 'shortcode-ui:select', this.shortcodeUiSelect );

		this.ShortcodeUiRenderSearch( view );

		this.state().refresh();

	},

	ShortcodeUiRenderEdit : function( id, tab ) {

		var view = new EditShortcodeForm({
			model: this.state('shortcode-ui').getShortcode()
		});

		this.content.set( view );

		view.on( 'shortcode-ui:cancel', this.shortcodeUiReset );

		this.state().refresh();

	},

	ShortcodeUiCreateToolbar : function( toolbar ) {

		var text;

		if ( 'shortcode' in this.options ) {
			text = shortcodeUIData.strings.media_frame_toolbar_update_label;
		} else {
			text = shortcodeUIData.strings.media_frame_toolbar_insert_label;
		}

		toolbar.view = new Toolbar( {
			controller : this,
			items: {
				insert: {
					text:     text,
					style:    'primary',
					priority: 80,
					requires: false,
					click:    this.shortcodeUiInsert,
					disabled: true,
				}
			}
		} );
	},

	ShortcodeUiRenderSearch: function( browseView ) {

		var view, searchView, listView;

		view = new wp.media.view.Toolbar( {
			controller: this,
		} );

		var controller = this.state('shortcode-ui');

		searchView = new wp.media.view.Search( {
			controller:    controller,
			model:         controller.props,
			shortcodeList: this.shortcodes,
			priority:      60
		} );

		listView = this.content.get();

		listView.$el.addClass( 'has-toolbar' );

		browseView.views.add( view );

		view.set( 'search', searchView.render() );

		controller.props.on( 'change:search', function() {
			listView.search( controller.props.get('search' ) );
		}.bind(this) );

	},

	ShortcodeUiRenderMenu: function( view ) {

		// Add a menu separator link.
		view.set({
			'shortcode-ui-separator': new wp.media.View({
				className: 'separator',
				priority: 65
			})
		});

		// Hide menu if editing.
		_.defer( function() {
			if ( this.state('shortcode-ui').getShortcode() ) {
				view.controller.$el.addClass( 'hide-menu' );
			}
		}.bind( this ) );

	},

} );

module.exports = mediaFrame;
