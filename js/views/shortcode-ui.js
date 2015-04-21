var Backbone = require('backbone'),
	insertShortcodeList = require('sui-views/insert-shortcode-list'),
	TabbedView = require('sui-views/tabbed-view'),
	ShortcodePreview = require('sui-views/shortcode-preview'),
	EditShortcodeForm = require('sui-views/edit-shortcode-form'),
	Toolbar = require('sui-views/media-toolbar'),
	SearchShortcode = require('sui-views/search-shortcode'),
	sui = require('sui-utils/sui'),
	$ = require('jquery');

var Shortcode_UI = Backbone.View.extend({

	events: {
		"click .add-shortcode-list li":      "select",
		"click .edit-shortcode-form-cancel": "cancelSelect"
	},

	initialize: function(options) {
		this.controller = options.controller.state();
		//toolbar model looks for controller.state()
		this.toolbar_controller = options.controller;
	},

	createToolbar: function(options) {
		toolbarOptions = {
			controller: this.toolbar_controller
		}

		this.toolbar = new Toolbar( toolbarOptions );

		this.views.add( this.toolbar );

		this.toolbar.set( 'search', new SearchShortcode({
			controller:    this.controller,
			model:         this.controller.props,
			shortcodeList: this.shortcodeList,
			priority:   60
		}).render() );

	},

	render: function() {

		this.$el.html('');

		switch( this.controller.props.get('action') ) {
			case 'select' :
				this.renderSelectShortcodeView();
				break;
			case 'update' :
			case 'insert' :
				this.renderEditShortcodeView();
				break;
		}

	},

	renderSelectShortcodeView: function() {
		this.views.unset();
		this.shortcodeList = new insertShortcodeList( { shortcodes: sui.shortcodes } );
		this.createToolbar();
		this.views.add('', this.shortcodeList);
	},

	renderEditShortcodeView: function() {
		var shortcode = this.controller.props.get( 'currentShortcode' );
		var view = new TabbedView({
			tabs: {
				edit: {
					label: shortcodeUIData.strings.edit_tab_label,
					content: new EditShortcodeForm({ model: shortcode })
				},

				preview: {
					label: shortcodeUIData.strings.preview_tab_label,
					content: new ShortcodePreview({ model: shortcode }),
					open: function() {
						this.render();
					}
				}
			},

			styles: {
				group:	'media-router edit-shortcode-tabs',
				tab:	'media-menu-item edit-shortcode-tab'
			}
		});

		this.$el.append( view.render().el );

		if ( this.controller.props.get('action') === 'update' ) {
			this.$el.find( '.edit-shortcode-form-cancel' ).remove();
		}

		return this;

	},

	cancelSelect: function( e ) {
		e.preventDefault();

		this.controller.props.set( 'action', 'select' );
		this.controller.props.set( 'currentShortcode', null );
		this.render();
	},

	select: function(e) {
		this.controller.props.set( 'action', 'insert' );
		var target    = $(e.currentTarget).closest( '.shortcode-list-item' );
		var shortcode = sui.shortcodes.findWhere( { shortcode_tag: target.attr( 'data-shortcode' ) } );

		if ( ! shortcode ) {
			return;
		}

		this.controller.props.set( 'currentShortcode', shortcode.clone() );

		this.render();

	},

});

module.exports = Shortcode_UI;
