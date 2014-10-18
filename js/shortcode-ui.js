var Shortcode_UI;

( function( $ ) {

	var t = Shortcode_UI = this;

	t.model      = {};
	t.collection = {};
	t.view       = {};
	t.utils      = {};

	// Modal Controller
	t.model.Shortcode_UI = Backbone.Model.extend({
		_this: this,
		openInsertModal: function() {
			this.set( 'action', 'select' );
			this.set( 'currentShortcode', null );
			frame = new t.view.insertModal.frame( this );
			frame.open();
		},
		openEditModal: function( shortcodeModel ) {
			this.set( 'action', 'update' );
			this.set( 'currentShortcode', shortcodeModel );
			frame = new t.view.insertModal.frame( this );
			frame.open();
		},
	});

	t.model.ShortcodeAttribute = Backbone.Model.extend({
		defaults: {
			attr:  '',
			label: '',
			type:  '',
			value: '',
		},
	});

	t.model.ShortcodeAttributes = Backbone.Collection.extend({
		model: t.model.ShortcodeAttribute,
		clone: function(deep) {
			if ( deep ) {
				return new this.constructor( _.map( this.models, function(m) {
					return m.clone();
				} ) );
			} else {
				return Backbone.Collection.prototype.clone();
			}
		}
	});

	t.model.Shortcode = Backbone.Model.extend({

		defaults: {
			label: '',
			shortcode: '',
			attrs: t.model.ShortcodeAttributes,
		},

		/**
		 * Custom set method.
		 * Handles setting the attribute collection.
		 */
		set: function( attributes, options ) {

		    if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof t.model.ShortcodeAttributes ) ) {
		        attributes.attrs = new t.model.ShortcodeAttributes( attributes.attrs );
		    }

		    return Backbone.Model.prototype.set.call(this, attributes, options);
		},

		/**
		 * Custon toJSON.
		 * Handles converting the attribute collection to JSON.
		 */
		toJSON: function( options ) {
			options = Backbone.Model.prototype.toJSON.call(this, options);
			if ( options.attrs !== undefined && ( options.attrs instanceof t.model.ShortcodeAttributes ) ) {
				options.attrs = options.attrs.toJSON();
			}
			return options;
    	},

    	/**
    	 * Make sure we don't clone a reference to attributes.
    	 */
    	clone: function() {
    		var clone = Backbone.Model.prototype.clone.call( this );
    		// Deep clone attributes.
    		clone.set( 'attrs', clone.get( 'attrs' ).clone( true ) );
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

				if ( attr.get( 'attr' ) === 'content' ) {
					content = attr.get( 'value' );
				} else {
					attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );
				}

			} );

			template = "[shortcode attributes]"

			if ( content && content.length > 1 ) {
				template += "content[/shortcode]"
			}

			template = template.replace( /shortcode/g, this.get('shortcode_tag') );
			template = template.replace( /attributes/g, attrs.join( ' ' ) );
			template = template.replace( /content/g, content );

			return template;

		}

	});

	// Shortcode Collection
	t.collection.Shortcodes = Backbone.Collection.extend({
		model: t.model.Shortcode
	});

	/**
	 * Single shortcode list item view.
	 * Used for add new shortcode modal.
	 */
	t.view.insertModalListItem = Backbone.View.extend({
		tagName: 'li',
		template:  wp.template('add-shortcode-list-item'),
		className: 'shortcode-list-item',

		render: function(){

			var data = this.model.toJSON();

			this.$el.attr( 'data-shortcode', data.shortcode_tag );

			if ( ( 'listItemImage' in data ) && 0 === data.listItemImage.indexOf( 'dashicons-' ) ) {
				data.listItemImage = '<div class="dashicons ' + data.listItemImage + '"></div>';
			}

			return this.$el.html( this.template( data ) );
		}
	});

	/**
	 * Single edit shortcode content view.
	 * Used for add/edit shortcode modal.
	 */
	t.view.editModalListItem = Backbone.View.extend({

		template: wp.template('shortcode-default-edit-form'),

		events: {
			'keyup .edit-shortcode-form-fields input[type="text"]': 'inputValueChanged',
			'keyup .edit-shortcode-form-fields textarea': 'inputValueChanged',
			'change .edit-shortcode-form-fields select': 'inputValueChanged',
			'change .edit-shortcode-form-fields input[type=checkbox]': 'inputValueChanged',
			'change .edit-shortcode-form-fields input[type=radio]': 'inputValueChanged',
		},

		// Handle custom params passed to view.
		initialize: function(options) {
		    this.options = {};
		    this.options.action = options.action;
		},

		/**
		 * Input Changed Update Callback.
		 *
		 * If the input field that has changed is for content or a valid attribute,
		 * then it should update the model.
		 */
		inputValueChanged: _.debounce( function( e ) {

			var $el = $( e.target );

			var attribute = this.model.get( 'attrs' ).findWhere( {
				'attr': $el.attr('name')
			} );

			if ( attribute ) {
				attribute.set( 'value', $el.val() );
			}

		}, 100 ),

		/**
		 * Render the Edit form.
		 * Uses custom template passed by model if available
		 * Otherwise - displays functional default.
		 */
		render: function(){

			var template, fieldTemplate, fieldContainer, data, view, fieldView;

			view = this.$el.html( this.template( this.model.toJSON() ) );

			fieldContainer = view.find( '.edit-shortcode-form-fields' );

			this.model.get( 'attrs' ).each( function( attr ) {
				fieldTemplate = wp.template( 'shortcode-ui-field-' + attr.get( 'type' ) );
				fieldContainer.append( fieldTemplate( attr.toJSON() ) );
			} );

			return view;

		},

	});

	t.view.insertModal = {

		frame: function( delegate ) {

			if ( this._frame )
				return this._frame;

			var _frame = wp.media.view.Frame.extend({

				className: 'media-frame',
				template:  wp.media.template('shortcode-ui-media-frame'),
				model: delegate,
				events: {
					"click .add-shortcode-list li": "selectEditShortcode",
					"click .media-button-insert": "insertShortcode",
					"submit .edit-shortcode-form": "insertShortcode",
					"click .edit-shortcode-form-cancel": 'cancelInsert'
				},

				initialize: function( a ) {

					this.shortcodes = Shortcode_UI.shortcodes;

					this.options = this.model.attributes;

					if ( ! this.options.action ) {
						this.options.action = 'select';
					}

					wp.media.view.Frame.prototype.initialize.apply( this, arguments );

					// Ensure core UI is enabled.
					this.$el.addClass('wp-core-ui');

					this.originalActiveEditor = false;

					// Initialize modal container view.
					this.modal = new wp.media.view.Modal({
						controller: this,
						title:	  "Edit Image"
					});

					this.modal.content( this );

					this.activeRichTextEditors = Array();

					this.modal.$el.addClass('shortcode-ui-insert-modal')

				},

				render: function() {

					var r = wp.media.view.Frame.prototype.render.apply( this, arguments );

					this.$toolbarEl  = this.$el.find( '.media-frame-toolbar' );
					this.$contentEl = this.$el.find( '.media-frame-content' );

					this.$contentEl.html('');
					this.$toolbarEl.html('');

					switch( this.options.action ) {
						case 'select' :
							this.renderAddShortcodeList();
							break;
						case 'update' :
						case 'insert' :
							this.renderEditShortcodeForm();
							break;
					}

					this.renderFooter();

					return r;
				},

				renderAddShortcodeList: function() {

					var list = $('<ul class="add-shortcode-list">');

					this.shortcodes.each( function( shortcode ) {
						var view = new t.view.insertModalListItem( { model: shortcode } );
						list.append( view.render( shortcode.toJSON() ) );
					} );

					this.$contentEl.append( list );

				},

				renderEditShortcodeForm: function() {
					var view = new t.view.editModalListItem( {
						model:  this.options.currentShortcode,
						action: this.options.action
					} );

					this.$contentEl.append( view.render() );

					if ( this.options.action === 'update' ) {
						this.$contentEl.find( '.edit-shortcode-form-cancel' ).remove();
					}

				},

				// @todo make this nicer.
				renderFooter: function() {

					var toolbar = $( '<div class="media-toolbar" />' );
					var el = $( '<div class="media-toolbar-primary" />' );
					var buttonSubmit = $('<button href="#" class="button media-button button-primary button-large media-button-insert" disabled="disabled">Insert into post</button>');

					buttonSubmit.appendTo( el );
					el.appendTo( toolbar );
					toolbar.appendTo( this.$toolbarEl );

					switch( this.options.action ) {
						case 'select' :
							buttonSubmit.attr( 'disabled', 'disabled' );
							break;
						case 'insert' :
							buttonSubmit.removeAttr( 'disabled' );
							break;
						case 'update' :
							buttonSubmit.removeAttr( 'disabled' );
							buttonSubmit.html( 'Update' );
							break;
					}

				},

				cancelInsert: function() {
					this.options.action = 'select';
					this.options.currentShortcode = null;
					this.render();
				},

				selectEditShortcode: function(e) {
					this.options.action = 'insert';
					var target    = $(e.currentTarget).closest( '.shortcode-list-item' );
					var shortcode = this.shortcodes.findWhere( { shortcode_tag: target.attr( 'data-shortcode' ) } );

					if ( ! shortcode ) {
						return;
					}

					this.options.currentShortcode = shortcode.clone();

					this.render();

				},

				insertShortcode: function() {
					var shortcode = this.options.currentShortcode.formatShortcode();
					send_to_editor( shortcode );
					this.close();
				}

			});

			// Map some of the modal's methods to the frame.
			_.each(['open','close','attach','detach','escape'], function( method ) {
				_frame.prototype[ method ] = function( view ) {
					if ( this.modal )
						this.modal[ method ].apply( this.modal, arguments );
					return this;
				};
			});

			this._frame = new _frame();

			return this._frame;
		},

		render: function() {

		},

		init: function() {

		}

	};

	/**
	 * Generic shortcode mce view constructor.
	 */
	t.utils.shorcodeViewConstructor = {

		View: {

			shortcodeHTML: false,

			initialize: function( options ) {

				var placeholderShortcode = Shortcode_UI.shortcodes.findWhere( { shortcode_tag: options.shortcode.tag } );

				if ( ! placeholderShortcode ) {
					return;
				}

				shortcode = placeholderShortcode.clone();

				shortcode.get( 'attrs' ).each( function( attr ) {

					if ( attr.get( 'attr') in options.shortcode.attrs.named ) {
						attr.set(
							'value',
							options.shortcode.attrs.named[ attr.get( 'attr') ]
						);
					}

					if ( attr.get( 'attr' ) === 'content' && ( 'content' in  options.shortcode ) ) {
						attr.set( 'value', options.shortcode.content );
					}

				});

				this.shortcode = shortcode;

			},

			/**
			 * Render the shortcode
			 *
			 * To ensure consistent rendering - this makes an ajax request to the admin and displays.
			 * @return string html
			 */
			getHtml: function() {

				var t = this, data;

				if ( false === t.shortcodeHTML ) {

					data = {
						action: 'do_shortcode',
						post_id: $('#post_ID').val(),
						shortcode: this.shortcode.formatShortcode()
					};

					$.post( ajaxurl, data, function( response ) {
						// Note - set even if empty to prevent this firing multiple times.
						t.shortcodeHTML = response;
						t.render( true );
					});

				}

				return t.shortcodeHTML;

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

			var megaRegex = /\[(\S+)([^\]]+)?\]([^\[]*)?(\[\/(\S+?)\])?/;
			var matches = shortcodeString.match( megaRegex );

			if ( ! matches ) {
				return;
			}

			defaultShortcode = Shortcode_UI.shortcodes.findWhere( { shortcode_tag: matches[1] } );

			if ( ! defaultShortcode ) {
				return;
			}

			currentShortcode = defaultShortcode.clone();

			if ( typeof( matches[2] ) != undefined ) {

				attributeMatches = matches[2].match(/(\S+?=".*?")/g );

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

			Shortcode_UI.modal.openEditModal( currentShortcode );

		}

	}

	$(document).ready(function(){

		t.shortcodes = new t.collection.Shortcodes( shortcodeUIData.shortcodes )
		t.modal      = new t.model.Shortcode_UI( shortcodeUIData.modalOptions );

		$('.shortcode-editor-open-insert-modal').click( function(e) {
			e && e.preventDefault();
			t.modal.openInsertModal();
		});

		t.shortcodes.each( function( shortcode ) {

			// Register the mce view for each shortcode.
			// Note - clone the constructor.
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				$.extend( true, {}, t.utils.shorcodeViewConstructor )
			);

		} );

	});

} )( jQuery );
