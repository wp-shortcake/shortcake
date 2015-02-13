var Shortcode_UI;

( function( $ ) {

	var sui = window.Shortcode_UI = {
		models:      {},
		collections: {},
		views:       {},
		controllers: {},
		utils:       {},
	}

	/**
	 * Shortcode Attribute Model.
	 */
	sui.models.ShortcodeAttribute = Backbone.Model.extend({
		defaults: {
			attr:        '',
			label:       '',
			type:        '',
			value:       '',
			placeholder: '',
		},
	});

	/**
	 * Shortcode Attributes collection.
	 */
	sui.models.ShortcodeAttributes = Backbone.Collection.extend({
		model: sui.models.ShortcodeAttribute,
		//  Deep Clone.
		clone: function() {
			return new this.constructor( _.map( this.models, function(m) {
				return m.clone();
			} ) );
		}
	});

	/**
	 * Shortcode Model
	 */
	sui.models.Shortcode = Backbone.Model.extend({

		defaults: {
			label: '',
			shortcode_tag: '',
			attrs: sui.models.ShortcodeAttributes,
		},

		/**
		 * Custom set method.
		 * Handles setting the attribute collection.
		 */
		set: function( attributes, options ) {

			if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof sui.models.ShortcodeAttributes ) ) {
				attributes.attrs = new sui.models.ShortcodeAttributes( attributes.attrs );
			}

			return Backbone.Model.prototype.set.call(this, attributes, options);
		},

		/**
		 * Custom toJSON.
		 * Handles converting the attribute collection to JSON.
		 */
		toJSON: function( options ) {
			options = Backbone.Model.prototype.toJSON.call(this, options);
			if ( options.attrs !== undefined && ( options.attrs instanceof sui.models.ShortcodeAttributes ) ) {
				options.attrs = options.attrs.toJSON();
			}
			return options;
		},

		/**
		 * Custom clone
		 * Make sure we don't clone a reference to attributes.
		 */
		clone: function() {
			var clone = Backbone.Model.prototype.clone.call( this );
			clone.set( 'attrs', clone.get( 'attrs' ).clone() );
			return clone;
		},

		/**
		 * Get the shortcode as... a shortcode!
		 *
		 * @return string eg [shortcode attr1=value]
		 */
		formatShortcode: function() {

			var template, shortcodeAttributes, attrs = [], content;

			this.get( 'attrs' ).each( function( attr ) {

				// Skip empty attributes.
				if ( ! attr.get( 'value' ) ||  attr.get( 'value' ).length < 1 ) {
					return;
				}

				// Handle content attribute as a special case.
				if ( attr.get( 'attr' ) === 'content' ) {
					content = attr.get( 'value' );
				} else {
					attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );
				}

			} );

			template = "[{{ shortcode }} {{ attributes }}]"

			if ( content && content.length > 0 ) {
				template += "{{ content }}[/{{ shortcode }}]"
			}

			template = template.replace( /{{ shortcode }}/g, this.get('shortcode_tag') );
			template = template.replace( /{{ attributes }}/g, attrs.join( ' ' ) );
			template = template.replace( /{{ content }}/g, content );

			return template;

		}

	});

	// Shortcode Collection
	sui.collections.Shortcodes = Backbone.Collection.extend({
		model: sui.models.Shortcode
	});

	/**
	 * Single shortcode list item view.
	 */
	sui.views.insertShortcodeListItem = wp.Backbone.View.extend({

		tagName: 'li',
		template:  wp.template('add-shortcode-list-item'),
		className: 'shortcode-list-item',

		render: function() {

			var data = this.model.toJSON();
			this.$el.attr( 'data-shortcode', data.shortcode_tag );

			if ( ( 'listItemImage' in data ) && 0 === data.listItemImage.indexOf( 'dashicons-' ) ) {
				data.listItemImage = '<div class="dashicons ' + data.listItemImage + '"></div>';
			}

			this.$el.html( this.template( data ) );

			return this;

		}
	});

	sui.views.insertShortcodeList = wp.Backbone.View.extend({

		tagName: 'div',
		template:  wp.template('add-shortcode-list'),

		initialize: function(options) {

			var t = this;

			t.options = {};
			t.options.shortcodes = options.shortcodes;

			t.options.shortcodes.each( function( shortcode ) {
				t.views.add( 'ul', new sui.views.insertShortcodeListItem( {
					model: shortcode
				} ) );
			} );

		},

	});

	/**
	 * Abstraction to manage tabbed content. Tab parameters (e.g., label) along with views for associated content are
	 * passed to initialize the tabbed view.
	 *
	 * @class TabbedView
	 * @constructor
	 * @extends Backbone.View
	 * @params [options]
	 * 	@params [options.tabs] {Object} A hash of key:value pairs, where each value is itself an object with the
	 * 	following properties:
	 *
	 * 		label: The label to display on the tab.
	 * 		content: The `Backbone.View` associated with the tab content.
	 */
	sui.views.TabbedView = Backbone.View.extend({

		template: wp.template( 'tabbed-view-base' ),
		tabs: {},

		events: {
			'click [data-role="tab"]': function( event ) {
				this.tabSwitcher( event );
			}
		},

		initialize: function( options ) {
			Backbone.View.prototype.initialize.apply( this, arguments );

			_.defaults( this.options = ( options || {}), { styles: { group: '', tab: '' } });

			this.tabs = _.extend( this.tabs, options.tabs );
		},

		/**
		 * @method render
		 * @chainable
		 * @returns {TabbedView}
		 */
		render: function() {
			var $content;

			this.$el.html( this.template({ tabs: this.tabs, styles: this.options.styles }) );

			$content = this.$( '[data-role="tab-content"]' );
			$content.empty();

			_.each( this.tabs, function( tab ) {
				var $el = tab.content.render().$el;
				$el.hide();
				$content.append( $el );
			});

			this.select( 0 );

			return this;
		},

		/**
		 * Switches tab when previewing or editing
		 */
		tabSwitcher: function(event) {
			event.stopPropagation();
			event.preventDefault();

			var target = $( event.currentTarget ).attr( 'data-target' );

			this.select( target );
		},

		/**
		 * Programmatically select (activate) a specific tab. Used internally to process tab click events.
		 *
		 * @method select
		 * @param selector {number|string} The index (zero based) or key of the target tab.
		 */
		select: function( selector ) {
			var index = 0;
			var target = null;
			var tab;

			selector = selector || 0;

			_.each( this.tabs, function( tab, key ) {
				tab.content.$el.hide();

				if ( selector === key || selector === index ) {
					target = key;
				}

				index = index + 1;
			});

			this.$( '[data-role="tab"]' ).removeClass( 'active' );

			if ( target ) {
				tab = this.tabs[target];

				this.$( '[data-role="tab"][data-target="' + target + '"]' ).addClass( 'active' );

				tab.content.$el.show();
				( typeof tab.open == 'function' ) && tab.open.call( tab.content );
			}
		}
	});

	/**
	 * Single edit shortcode content view.
	 */
	sui.views.EditShortcodeForm = wp.Backbone.View.extend({
		template: wp.template('shortcode-default-edit-form'),

		initialize: function() {

			var t = this;

			this.model.get( 'attrs' ).each( function( attr ) {

				// Get the field settings from localization data.
				var type = attr.get('type');

				if ( ! shortcodeUIFieldData[ type ] ) {
					return;
				}

				var viewObjName = shortcodeUIFieldData[ type ].view;
				var tmplName    = shortcodeUIFieldData[ type ].template;

				var view        = new sui.views[viewObjName]( { model: attr } );
				view.template   = wp.media.template( tmplName );
				view.shortcode = t.model;

				t.views.add( '.edit-shortcode-form-fields', view );

			} );

		},

	});

	sui.views.editAttributeField = Backbone.View.extend( {

		tagName: "div",

		events: {
			'keyup  input[type="text"]':   'updateValue',
			'keyup  input[type="hidden"]': 'updateValue',
			'keyup  textarea':             'updateValue',
			'change select':               'updateValue',
			'change input[type=checkbox]': 'updateValue',
			'change input[type=radio]':    'updateValue',
			'change input[type=email]':    'updateValue',
			'change input[type=number]':   'updateValue',
			'change input[type=date]':     'updateValue',
			'change input[type=url]':      'updateValue',
		},

		render: function() {
			this.$el.html( this.template( this.model.toJSON() ) );
			return this
		},

		/**
		 * Input Changed Update Callback.
		 *
		 * If the input field that has changed is for content or a valid attribute,
		 * then it should update the model.
		 */
		updateValue: function( e ) {
			var $el = $(this.el).find( '[name=' + this.model.get( 'attr' ) + ']' );
			if ( 'checkbox' === this.model.attributes.type ) {
				this.model.set( 'value', $el.is( ':checked' ) );
			} else {
				this.model.set( 'value', $el.val() );
			}
		},

	} );

	/**
	 * Preview of rendered shortcode. Asynchronously fetches rendered shortcode content from WordPress and displays
	 * in an &lt;iframe> to isolate editor styles.
	 *
	 * @class sui.views.ShortcodePreview
	 * @constructor
	 * @params options
	 * @params options.model {sui.models.Shortcode} Requires a valid shortcode.
	 */
	sui.views.ShortcodePreview = Backbone.View.extend({

		initialize: function( options ) {
			this.stylesheets = this.getEditorStyles().join( "\n" );
		},

		/**
		 * @method render
		 * @chainable
		 * @returns {ShortcodePreview}
		 */
		render: function() {
			var self = this;
			var stylesheets = this.stylesheets;

			self.renderIFrame({ body: wp.mce.View.prototype.loadingPlaceholder(), head: stylesheets });

			this.fetchShortcode( function( result ) {
				self.renderIFrame({ body: result, head: stylesheets });
			});

			return this;
		},

		/**
		 * Render a child iframe, removing any previously rendered iframe. Additionally, observe the rendered iframe
		 * for mutations and resize as necessary to match content.
		 *
		 * @param params
		 */
		renderIFrame: function( params ) {

			var $iframe, resize;
			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

			_.defaults( params || {}, { 'head': '', 'body': '', 'body_classes': 'shortcake shortcake-preview' });

			$iframe = $( '<iframe/>', {
				src: tinymce.Env.ie ? 'javascript:""' : '',
				frameBorder: '0',
				allowTransparency: 'true',
				scrolling: 'no',
				style: "width: 100%; display: block",
			} );

			resize = function() {
				// Make sure the iframe still exists.
				$iframe && $iframe.height( $iframe.contents().find('body').height() );
			};

			$iframe.load( function() {

				var head = $(this).contents().find('head'),
				    body = $(this).contents().find('body');

				head.html( params.head );
				body.html( params.body );
				body.addClass( params.body_classes );

				resize();

				if ( MutationObserver ) {
					new MutationObserver( _.debounce( function() {
						resize();
					}, 100 ) )
					.observe( $(this).contents().find('body')[0], {
						attributes: true,
						childList: true,
						subtree: true
					} );
				} else {
					for ( i = 1; i < 6; i++ ) {
						setTimeout( resize, i * 700 );
					}
				}

			} );

			this.$el.html( $iframe );

		},

		/**
		 * Makes an AJAX call to the server to render the shortcode based on user supplied attributes. Server-side
		 * rendering is necessary to allow for shortcodes that incorporate external content based on shortcode
		 * attributes.
		 *
		 * @method fetchShortcode
		 * @returns {String} Rendered shortcode markup (HTML).
		 */
		fetchShortcode: function( callback ) {

			wp.ajax.post( 'do_shortcode', {
				post_id: $( '#post_ID' ).val(),
				shortcode: this.model.formatShortcode(),
				nonce: shortcodeUIData.nonces.preview,
			}).done( function( response ) {
				callback( response );
			}).fail( function() {
				callback( '<span class="shortcake-error">' + shortcodeUIData.strings.mce_view_error + '</span>' );
			} );

		},

		/**
		 * Returns an array of <link> tags for stylesheets applied to the TinyMCE editor.
		 *
		 * @method getEditorStyles
		 * @returns {Array}
		 */
		getEditorStyles: function() {
			var styles = {};

			_.each( tinymce.editors, function( editor ) {
				_.each( editor.dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
					var href;
					( href = link.href ) && ( styles[href] = true );	// Poor man's de-duping.
				});
			});

			styles = _.map( _.keys( styles ), function( href ) {
				return $( '<link rel="stylesheet" type="text/css">' ).attr( 'href', href )[0].outerHTML;
			});

			return styles;
		},

	});

	sui.views.Shortcode_UI = Backbone.View.extend({

		events: {
			"click .add-shortcode-list li":      "select",
			"click .edit-shortcode-form-cancel": "cancelSelect"
		},

		initialize: function(options) {
			this.controller = options.controller.state();
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
			this.views.add(
				'',
				new sui.views.insertShortcodeList( { shortcodes: sui.shortcodes } )
			);
		},

		renderEditShortcodeView: function() {

			var shortcode = this.controller.props.get( 'currentShortcode' );

			var view = new sui.views.TabbedView({
				tabs: {
					edit: {
						label: shortcodeUIData.strings.edit_tab_label,
						content: new sui.views.EditShortcodeForm({
							model: shortcode
						})
					},
					preview: {
						label: shortcodeUIData.strings.preview_tab_label,
						content: new sui.views.ShortcodePreview({
							model: shortcode,
						}),
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

		cancelSelect: function() {
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

	sui.controllers.MediaController = wp.media.controller.State.extend({

		initialize: function(){

			this.props = new Backbone.Model({
				currentShortcode: null,
				action: 'select',
			});

			this.props.on( 'change:action', this.refresh, this );

		},

		refresh: function() {
			if ( this.frame && this.frame.toolbar ) {
				this.frame.toolbar.get().refresh();
			}
		},

		insert: function() {
			var shortcode = this.props.get('currentShortcode');
			if ( shortcode ) {
				send_to_editor( shortcode.formatShortcode() );
				this.reset();
				this.frame.close();
			}
		},

		reset: function() {
			this.props.set( 'action', 'select' );
			this.props.set( 'currentShortcode', null );
		},

	});

	var shortcodeFrame = wp.media.view.MediaFrame.Post;
	wp.media.view.MediaFrame.Post = shortcodeFrame.extend({

		initialize: function() {

			shortcodeFrame.prototype.initialize.apply( this, arguments );

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

			var controller = new sui.controllers.MediaController( opts );

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
				new sui.views.Shortcode_UI( {
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

			toolbar.view = new  sui.views.Toolbar( {
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

	});

	/**
	 * sui Toolbar view that extends wp.media.view.Toolbar
	 * to define cusotm refresh method
	 */
	sui.views.Toolbar = wp.media.view.Toolbar.extend({
		initialize: function() {
			_.defaults( this.options, {
				requires: false
			});
			// Call 'initialize' directly on the parent class.
			wp.media.view.Toolbar.prototype.initialize.apply( this, arguments );
		},

		refresh: function() {
			var action = this.controller.state().props.get('action');
			this.get('insert').model.set( 'disabled', action == 'select' );
			/**
			 * call 'refresh' directly on the parent class
			 */
			wp.media.view.Toolbar.prototype.refresh.apply( this, arguments );
		}
	});

	/**
	 * Generic shortcode mce view constructor.
	 * This is cloned and used by each shortcode when registering a view.
	 */
	sui.utils.shortcodeViewConstructor = {

		View: {

			shortcodeHTML: false,

			initialize: function( options ) {

				var shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.shortcode.tag } );

				if ( ! shortcodeModel ) {
					return;
				}

				shortcode = shortcodeModel.clone();

				shortcode.get( 'attrs' ).each( function( attr ) {

					if ( attr.get( 'attr') in options.shortcode.attrs.named ) {
						attr.set(
							'value',
							options.shortcode.attrs.named[ attr.get( 'attr') ]
						);
					}

					if ( attr.get( 'attr' ) === 'content' && ( 'content' in options.shortcode ) ) {
						attr.set( 'value', options.shortcode.content );
					}

				});

				this.shortcode = shortcode;

				this.fetch();
			},

			fetch: function() {

				var self = this;

				wp.ajax.post( 'do_shortcode', {
					post_id: $( '#post_ID' ).val(),
					shortcode: this.shortcode.formatShortcode(),
					nonce: shortcodeUIData.nonces.preview,
				}).done( function( response ) {
					self.parsed = response;
					self.render( true );
				}).fail( function() {
					self.parsed = '<span class="shortcake-error">' + shortcodeUIData.strings.mce_view_error + '</span>';
					self.render( true );
				} );

 			},

			/**
			 * Render the shortcode
			 *
			 * To ensure consistent rendering - this makes an ajax request to the admin and displays.
			 * @return string html
			 */
			getHtml: function() {
				return this.parsed;
			}

		},

		/**
		 * Edit shortcode.
		 *
		 * Parses the shortcode and creates shortcode mode.
		 * @todo - I think there must be a cleaner way to get
		 * the shortcode & args here that doesn't use regex.
		 */
		edit: function( node ) {

			var shortcodeString, model, attr;

			shortcodeString = decodeURIComponent( $(node).attr( 'data-wpview-text' ) );

			var megaRegex = /\[([^\s\]]+)([^\]]+)?\]([^\[]*)?(\[\/(\S+?)\])?/;
			var matches = shortcodeString.match( megaRegex );

			if ( ! matches ) {
				return;
			}

			defaultShortcode = sui.shortcodes.findWhere( { shortcode_tag: matches[1] } );

			if ( ! defaultShortcode ) {
				return;
			}

			currentShortcode = defaultShortcode.clone();

			if ( matches[2] ) {

				attributeMatches = matches[2].match(/(\S+?=".*?")/g ) || [];

				// convert attribute strings to object.
				for ( var i = 0; i < attributeMatches.length; i++ ) {

					var bitsRegEx = /(\S+?)="(.*?)"/g;
					var bits = bitsRegEx.exec( attributeMatches[i] );

					attr = currentShortcode.get( 'attrs' ).findWhere( { attr: bits[1] } );
					if ( attr ) {
						attr.set( 'value', bits[2] );
					}

				}

			}

			if ( matches[3] ) {
				var content = currentShortcode.get( 'attrs' ).findWhere( { attr: 'content' } );
				if ( content ) {
					content.set( 'value', matches[3] );
				}
			}

			var wp_media_frame = wp.media.frames.wp_media_frame = wp.media( {
				frame: "post",
				state: 'shortcode-ui',
				currentShortcode: currentShortcode,
			} );

			wp_media_frame.open();

		}

	}

	$(document).ready(function(){

		sui.shortcodes = new sui.collections.Shortcodes( shortcodeUIData.shortcodes )

		sui.shortcodes.each( function( shortcode ) {
			if( wp.mce.views ) {
				// Register the mce view for each shortcode.
				// Note - clone the constructor.
				wp.mce.views.register(
					shortcode.get('shortcode_tag'),
					$.extend( true, {}, sui.utils.shortcodeViewConstructor )
				);
			}
		} );

	});

} )( jQuery );
