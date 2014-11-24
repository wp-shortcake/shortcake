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
	 * Single edit shortcode content view.
	 */
	sui.views.editShortcodeForm = wp.Backbone.View.extend({

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

	/**
	 * Default Attribute field object.
	 *
	 * The template used by this view has the id tmpl-shortcode-ui-field-$type
	 * where type is passed when defining the attribute.
	 */
	sui.views.editAttributeField = wp.Backbone.View.extend( {

		tagName: "div",

		events: {
			'keyup  input[type="text"]': 'updateValue',
			'keyup  textarea':           'updateValue',
			'change select':             'updateValue',
			'change':                    'updateValue',
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
		updateValue: function() {
			var $el = $(this.el).find( '[name=' + this.model.get( 'attr' ) + ']' );
			this.model.set( 'value', $el.val() );
		},

	} );

	sui.views.Shortcode_UI = wp.Backbone.View.extend({

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

			var view = new sui.views.editShortcodeForm( {
				model:  this.controller.props.get( 'currentShortcode' ),
			} );

			this.views.unset();
			this.views.add( '', view );

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
			// @todo Need to trigger disabled state on button.
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

			var controller = new sui.controllers.MediaController( {
				id      : id,
				router  : false,
				toolbar : id + '-toolbar',
				menu    : 'default',
				title   : 'Insert Content Item',
				tabs    : [ 'insert' ],
				priority:  66,
				content : id + '-content-insert',
			} );

			if ( 'currentShortcode' in arguments[0] ) {
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

			this.shortcodeUIView = new sui.views.Shortcode_UI( {
				controller: this,
				className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
			} );

			this.content.set( this.shortcodeUIView );

		},

		toolbarRender: function( toolbar ) {},

		toolbarCreate : function( toolbar ) {
			toolbar.view = new  wp.media.view.Toolbar( {
				controller : this,
				items: {
					insert: {
						text: 'Insert Item', // added via 'media_view_strings' filter,
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

			var form = this.controller.shortcodeUIView.views.first();

			// Note that this *can* be a select shortcode list view.
			if ( form instanceof sui.views.editShortcodeForm ) {
				_.each( form.views.all(), function( field ) {
					field.updateValue();
				} );
			}

			this.controller.state().insert();

		},

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

			},

			/**
			 * @see wp.mce.View.getEditors
			 */
			getEditors: function( callback ) {
				var editors = [];

				_.each( tinymce.editors, function( editor ) {
					if ( editor.plugins.wpview ) {
						if ( callback ) {
							callback( editor );
						}

						editors.push( editor );
					}
				}, this );

				return editors;
			},

			/**
			 * @see wp.mce.View.getNodes
			 */
			getNodes: function( callback ) {
				var nodes = [],
					self = this;

				this.getEditors( function( editor ) {
					$( editor.getBody() )
					.find( '[data-wpview-text="' + self.encodedText + '"]' )
					.each( function ( i, node ) {
						if ( callback ) {
							callback( editor, node, $( node ).find( '.wpview-content' ).get( 0 ) );
						}

						nodes.push( node );
					} );
				} );

				return nodes;
			},

			/**
			 * Set the HTML. Modeled after wp.mce.View.setIframes
			 *
			 * If it includes a script tag, needs to be wrapped in an iframe
			 */
			setHtml: function( body ) {
				var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

				if ( body.indexOf( '<script' ) === -1 ) {
					this.shortcodeHTML = body;
					this.render( true );
					return;
				}

				this.getNodes( function ( editor, node, content ) {
					var dom = editor.dom,
					styles = '',
					bodyClasses = editor.getBody().className || '',
					iframe, iframeDoc, i, resize;

					content.innerHTML = '';
					head = '';

					$(node).addClass('wp-mce-view-show-toolbar');

					if ( ! wp.mce.views.sandboxStyles ) {
						tinymce.each( dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
							if ( link.href && link.href.indexOf( 'skins/lightgray/content.min.css' ) === -1 &&
								link.href.indexOf( 'skins/wordpress/wp-content.css' ) === -1 ) {

								styles += dom.getOuterHTML( link ) + '\n';
							}
						});

						wp.mce.views.sandboxStyles = styles;
					} else {
						styles = wp.mce.views.sandboxStyles;
					}

					// Seems Firefox needs a bit of time to insert/set the view nodes, or the iframe will fail
					// especially when switching Text => Visual.
					setTimeout( function() {
						iframe = dom.add( content, 'iframe', {
							src: tinymce.Env.ie ? 'javascript:""' : '',
							frameBorder: '0',
							allowTransparency: 'true',
							scrolling: 'no',
							'class': 'wpview-sandbox',
							style: {
								width: '100%',
								display: 'block'
							}
						} );

						iframeDoc = iframe.contentWindow.document;

						iframeDoc.open();
						iframeDoc.write(
							'<!DOCTYPE html>' +
							'<html>' +
								'<head>' +
									'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
									head +
									styles +
									'<style>' +
										'html {' +
											'background: transparent;' +
											'padding: 0;' +
											'margin: 0;' +
										'}' +
										'body#wpview-iframe-sandbox {' +
											'background: transparent;' +
											'padding: 1px 0 !important;' +
											'margin: -1px 0 0 !important;' +
										'}' +
										'body#wpview-iframe-sandbox:before,' +
										'body#wpview-iframe-sandbox:after {' +
											'display: none;' +
											'content: "";' +
										'}' +
									'</style>' +
								'</head>' +
								'<body id="wpview-iframe-sandbox" class="' + bodyClasses + '">' +
									body +
								'</body>' +
							'</html>'
						);
						iframeDoc.close();

						resize = function() {
							// Make sure the iframe still exists.
							iframe.contentWindow && $( iframe ).height( $( iframeDoc.body ).height() );
						};

						if ( MutationObserver ) {
							new MutationObserver( _.debounce( function() {
								resize();
							}, 100 ) )
							.observe( iframeDoc.body, {
								attributes: true,
								childList: true,
								subtree: true
							} );
						} else {
							for ( i = 1; i < 6; i++ ) {
								setTimeout( resize, i * 700 );
							}
						}

						editor.on( 'wp-body-class-change', function() {
							iframeDoc.body.className = editor.getBody().className;
						});
					}, 50 );
				});

			},

			/**
			 * Render the shortcode
			 *
			 * To ensure consistent rendering - this makes an ajax request to the admin and displays.
			 * @return string html
			 */
			getHtml: function() {

				var data;

				if ( false === this.shortcodeHTML ) {

					data = {
						action: 'do_shortcode',
						post_id: $('#post_ID').val(),
						shortcode: this.shortcode.formatShortcode(),
						nonce: shortcodeUIData.nonces.preview
					};

					$.post( ajaxurl, data, $.proxy( this.setHtml, this ) );

				}

				return this.shortcodeHTML;

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

			// Register the mce view for each shortcode.
			// Note - clone the constructor.
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				$.extend( true, {}, sui.utils.shortcodeViewConstructor )
			);

		} );

	});


	sui.views.editAttributeFieldPostSelect2 = sui.views.editAttributeField.extend( {

		render: function() {

			this.$el.html( this.template( this.model.toJSON() ) );

			var multiple = false;

			var ajaxData = {
				action    : 'shortcode_ui_post_field',
				nonce     : shortcodeUIPostFieldData[ this.shortcode.get( 'shortcode_tag') ][ this.model.get( 'attr' ) ].nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			this.$el.find( '.shortcode-ui-post-select' ).select2({
				// placeholder: "Search",
				// minimumInputLength: 3,
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					quietMillis: 250,
					data: function (term, page) {
						ajaxData.s    = term,
						ajaxData.page = page;
						return ajaxData;
					},
					results: function ( response, page ) {

						if ( ! response.success ) {
							return { results: {}, more: false };
						}

						var more = ( page * response.data.posts_per_page ) < response.data.found_posts; // whether or not there are more results available
						return { results: response.data.posts, more: more };

					},
				},

				/**
				 * Initialize Callback
				 * Used to set render the initial value.
				 * Has to make a request to get the title for the current ID.
				 */
				initSelection: function(element, callback) {

					var val = $(element).val();

					if ( val !== "" ) {

						var initAjaxData = jQuery.extend( true, {}, ajaxData );
						initAjaxData.action = 'shortcode_ui_post_field_init_values';
						initAjaxData.value = val;

						$.get( ajaxurl, initAjaxData ).done( function( response ) {

							// If not multi select - passing an array doesn't work.
							if ( ! multiple ) {
								response.data.posts = response.data.posts[0];
							}

							callback( response.data.posts );

						} );

					}
				},
			} );

			return this;

		}

	} );

} )( jQuery );


