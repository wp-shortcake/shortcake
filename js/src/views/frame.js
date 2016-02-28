var wp         = require('wp'),
	$          = require('jquery'),
	sui        = require('sui-utils/sui'),
	Controller = require('sui-controllers/frame-controller'),
	Toolbar    = require('sui-views/frame-toolbar'),
	ListView   = require('sui-views/insert-shortcode-list'),
	EditView   = require('sui-views/edit-shortcode-form.js'),
	Frame      = wp.media.view.Frame;

var ShortcodeUiFrame = Frame.extend( {

	className: 'media-frame',
	regions:   [ 'title', 'content', 'toolbar' ],
	template:  wp.template('media-frame'),

	initialize: function() {

		Frame.prototype.initialize.apply( this, arguments );

		_.bindAll( this, 'select', 'reset' );

		this.options = _.defaults( this.options, {
			state:          'shortcode-ui',
			modal:          true,
			title:          'Insert',
			updateTitle:    'Update',
			shortcodes:     [],
			insertCallback: null,
		} );

		// Initialize modal container view.
		if ( this.options.modal ) {
			this.modal = new wp.media.view.Modal({
				controller: this,
				title:      this.options.title
			});
			this.modal.content( this );
		}

		this.addStates();

		this.on( 'attach', _.bind( this.views.ready, this.views ), this );

		this.on( 'title:create:default', this.createTitle, this );
		this.title.mode('default');

		this.on( 'title:render', function( view ) {
			view.$el.append( '<span class="dashicons dashicons-arrow-down"></span>' );
		});

		this.on( 'toolbar:create:shortcode-ui-toolbar',        this.createToolbar, this );
		this.on( 'content:render:shortcode-ui-content-browse', this.renderBrowseMode, this );
		this.on( 'content:render:shortcode-ui-content-edit',   this.renderEditMode, this );

	},

	/**
	 * @returns {wp.media.view.ShortcodeUiFrame} Returns itself to allow chaining
	 */
	render: function() {

		// Activate the default state if no active state exists.
		if ( ! this.state() && this.options.state ) {
			this.setState( this.options.state );
		}

		return Frame.prototype.render.apply( this, arguments );

	},

	addStates: function() {

		var mode, opts, controller;

		mode = ( 'shortcode' in this.options ) ? 'edit' : 'browse';

		opts = {
			id             : 'shortcode-ui',
			toolbar        : 'shortcode-ui-toolbar',
			content        : 'shortcode-ui-content-' + mode,
			menu           : false,
			search         : true,
			router         : false,
			title          : this.options.title,
		};

		if ( 'shortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace(
				/%s/,
				this.options.shortcode.attributes.label
			);
		}

		controller = new Controller( opts );

		if ( 'shortcode' in this.options ) {
			controller.props.set( 'shortcode', this.options.shortcode );
		}

		this.states.add( controller );

	},

	/**
	 * @param {Object} title
	 * @this wp.media.controller.Region
	 */
	createTitle: function( title ) {
		title.view = new wp.media.View({
			controller: this,
			tagName:    'h1'
		});
	},

	select: function( shortcode ) {
		this.state().setShortcode( shortcode.clone() );
		this.content.mode( 'shortcode-ui-content-edit' );
	},

	reset: function() {
		this.state('shortcode-ui').reset();
		this.content.mode( 'shortcode-ui-content-browse' );
	},

	renderBrowseMode : function( contentRegion ) {

		var view = new ListView({
			shortcodes: this.options.shortcodes
		});

		this.content.set( view.render() );

		$( '.media-menu-item', this.$el ).click( this.reset );
		view.on( 'shortcode-ui:select', this.select );

		this.renderSearch( view );

		this.state().refresh();

	},

	renderEditMode : function( id, tab ) {

		var view = new EditView({
			model: this.state('shortcode-ui').getShortcode()
		});

		this.content.set( view );

		view.on( 'shortcode-ui:cancel', this.reset );

		this.state().refresh();

	},

	createToolbar : function( toolbar ) {

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
					click:    function() {
						this.controller.state().insert();
					},
					disabled: true,
				}
			}
		} );

	},

	/**
	 * Render Search Toolbar.
	 *
	 * Pass in the parent view.
	 */
	renderSearch: function( parentView ) {

		var state, listView;

		state = this.state( 'shortcode-ui' );

		parentView.views.add( new wp.media.view.Search( {
			controller:    state,
			model:         state.props,
		} ) );

		listView = this.content.get();
		listView.$el.addClass( 'has-search' );

		// Listen for change in search query, and call search method on listView.
		state.props.on( 'change:search', function() {
			listView.search( state.props.get('search' ) );
		}.bind(this) );

	},

} );

// Map some of the modal's methods to the frame.
_.each(['open','close','attach','detach','escape'], function( method ) {
	/**
	 * @returns {wp.media.view.ShortcodeUiFrame} Returns itself to allow chaining
	 */
	ShortcodeUiFrame.prototype[ method ] = function() {
		if ( this.modal ) {
			this.modal[ method ].apply( this.modal, arguments );
		}
		return this;
	};
});

module.exports = ShortcodeUiFrame;
