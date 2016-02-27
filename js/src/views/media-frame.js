var wp = require('wp'),
	$ = require('jquery'),
	sui = require('sui-utils/sui'),
	shortcodeUiController = require('sui-controllers/media-controller'),
	Toolbar = require('./media-toolbar'),
	SearchShortcode = require('sui-views/search-shortcode'),
	InsertShortcodeList = require('sui-views/insert-shortcode-list'),
	EditShortcodeForm = require('./edit-shortcode-form.js');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

	initialize: function() {

		postMediaFrame.prototype.initialize.apply( this, arguments );

		var id   = 'shortcode-ui';
		var mode = ( 'shortcode' in this.options ) ? 'edit' : 'browse';

		var opts = {
			id        : id,
			search    : true,
			router    : false,
			toolbar   : id + '-toolbar',
			menu      : 'default',
			title     : shortcodeUIData.strings.media_frame_menu_insert_label,
			priority  :  66,
			content   : id + '-content-' + mode,
			shortcode : ( 'shortcode' in this.options ) ? this.options.shortcode : null,
		};

		if ( 'shortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace( /%s/, this.options.shortcode.attributes.label );
		}

		this.shortcodeUiController = new shortcodeUiController( opts );
		this.shortcodes      = sui.shortcodes;

		this.states.add([ this.shortcodeUiController ]);

		_.bindAll( this, 'ShortcodeUiRenderBrowse', 'ShortcodeUiRenderEdit', 'ShortcodeUiCreateToolbar', 'ShortcodeUiRenderMenu', 'ShortcodeUiRenderSearch' );

		this.on( 'content:render:' + id + '-content-browse', this.ShortcodeUiRenderBrowse, this );
		// this.on( 'content:render:' + id + '-content-edit', this.ShortcodeUiRenderEdit, this );
		this.on( 'toolbar:create:' + id + '-toolbar', this.ShortcodeUiCreateToolbar, this );
		this.on( 'menu:render:default', this.ShortcodeUiRenderMenu );

	},

	events: function() {
		return _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item':            'shortcodeUiReset',
			'click .add-shortcode-list li':      'shortcodeUiSelect',
			'click .edit-shortcode-form-cancel': 'shortcodeUiReset',
		} );
	},

	shortcodeUiInsert: function() {
		this.controller.state().insert();
	},

	shortcodeUiSelect: function(e) {

		var target    = $( e.currentTarget ).closest( '.shortcode-list-item' );
		var shortcode = this.shortcodes.findWhere( { shortcode_tag: target.attr( 'data-shortcode' ) } );

		if ( ! shortcode ) {
			return;
		}

		this.state().setShortcode( shortcode.clone() );
		this.content.mode( 'shortcode-ui-content-edit' );

	},

	shortcodeUiReset: function( event ) {
		this.state('shortcode-ui').reset();
		this.content.mode( 'shortcode-ui-content-browse' );
	},

	ShortcodeUiRenderBrowse : function( contentRegion ) {

		// console.log( 'ShortcodeUiRenderBrowse', contentRegion );

		contentRegion.set( new InsertShortcodeList({
			shortcodes: this.shortcodes
		}) );

		this.ShortcodeUiRenderSearch( view );

	},

	ShortcodeUiRenderEdit : function( id, tab ) {

		var view = new EditShortcodeForm({
			model: this.state('shortcode-ui').getShortcode()
		});

		this.content.set( view );

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
					text: text,
					style: 'primary',
					priority: 80,
					requires: false,
					click: this.shortcodeUiInsert,
				}
			}
		} );
	},

	ShortcodeUiRenderSearch: function( browseView ) {

		var view, searchView, listView;

		view = new wp.media.view.Toolbar( {
			controller: this,
		} );

		searchView = new wp.media.view.Search( {
			controller:    this.shortcodeUiController,
			model:         this.shortcodeUiController.props,
			shortcodeList: this.shortcodes,
			priority:      60
		} );

		listView = this.content.get();

		listView.$el.addClass( 'has-toolbar' );

		browseView.views.add( view );

		view.set( 'search', searchView.render() );

		this.shortcodeUiController.props.on( 'change:search', function() {
			listView.search( this.shortcodeUiController.props.get('search' ) );
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
