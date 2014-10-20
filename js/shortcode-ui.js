var Shortcode_UI;

( function( $ ) {

	var t = Shortcode_UI = this;

	t.model      = {};
	t.collection = {};
	t.view       = {};
	t.controller = {};
	t.utils      = {};

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

			template = "[{{ shortcode }} {{ attributes }}]"

			if ( content && content.length > 1 ) {
				template += "{{ content }}[/{{ shortcode }}]"
			}

			template = template.replace( /{{ shortcode }}/g, this.get('shortcode_tag') );
			template = template.replace( /{{ attributes }}/g, attrs.join( ' ' ) );
			template = template.replace( /{{ content }}/g, content );

			return template;

		}

	});

	// Shortcode Collection
	t.collection.Shortcodes = Backbone.Collection.extend({
		model: t.model.Shortcode
	});

	/**
	 * Single shortcode list item view.
	 */
	t.view.insertShortcodeListItem = Backbone.View.extend({
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

	t.view.insertShortcodeList = Backbone.View.extend({

		tagName: 'div',

		initialize: function(options) {
			this.options = {};
			this.options.shortcodes = options.shortcodes;
		},

		render: function(){

			var t = this;

			t.$el.html('');

			var $listEl = $('<ul class="add-shortcode-list">');
			t.options.shortcodes.each( function( shortcode ) {

				var view = new Shortcode_UI.view.insertShortcodeListItem( {
					model: shortcode
				} );

				$listEl.append(
					view.render().el
				);

			} );

			t.$el.append( $listEl );

			return t;

		}

	});

	/**
	 * Single edit shortcode content view.
	 */
	t.view.shortcodeEditForm = Backbone.View.extend({

		template: wp.template('shortcode-default-edit-form'),

		render: function(){

			this.$el.html( this.template( this.model.toJSON() ) );
			var $fieldsEl = this.$el.find( '.edit-shortcode-form-fields' );

			this.model.get( 'attrs' ).each( function( attr ) {
				$fieldsEl.append(
					new t.view.attributeEditField( { model: attr } ).render()
				);
			} );

			return this;

		},

	});

	t.view.attributeEditField = Backbone.View.extend( {

		tagName: "div",

		events: {
			'keyup  input[type="text"]':   'updateValue',
			'keyup  textarea':             'updateValue',
			'change select':               'updateValue',
			'change input[type=checkbox]': 'updateValue',
			'change input[type=radio]':    'updateValue',
		},

		render: function() {
			this.template = wp.media.template( 'shortcode-ui-field-' + this.model.get( 'type' ) );
			return this.$el.html( this.template( this.model.toJSON() ) );
		},

		/**
		 * Input Changed Update Callback.
		 *
		 * If the input field that has changed is for content or a valid attribute,
		 * then it should update the model.
		 */
		updateValue: function( e ) {
			var $el = $( e.target );
			this.model.set( 'value', $el.val() );
		},

	} );

	t.view.Shortcode_UI = Backbone.View.extend({

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
			this.$el.append(
				new t.view.insertShortcodeList( { shortcodes: t.shortcodes } ).render().el
			);
		},

		renderEditShortcodeView: function() {

			var view = new t.view.shortcodeEditForm( {
				model:  this.controller.props.get( 'currentShortcode' ),
			} );

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
			var shortcode = Shortcode_UI.shortcodes.findWhere( { shortcode_tag: target.attr( 'data-shortcode' ) } );

			if ( ! shortcode ) {
				return;
			}

			this.controller.props.set( 'currentShortcode', shortcode.clone() );

			this.render();

		},

	});

	t.controller.MediaController = wp.media.controller.State.extend({

		initialize: function(){

			this.props = new Backbone.Model({
				currentShortcode: null,
				action: 'select',
			});

			this.props.on( 'change:action', this.refresh, this );

		},

		refresh: function() {
			// Need to trigger disabled state on button.
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

			var controller = new t.controller.MediaController( {
				id      : id,
				router  : id + '-router',
				toolbar : id + '-toolbar',
				menu    : 'default',
				title   : 'Insert Content Item',
				tabs    : [ 'insert' ],
				priority:  66, // places it above Insert From URL
				content : id + '-content-insert',
			} );

			if ( 'currentShortcode' in arguments[0] ) {
				controller.props.set( 'currentShortcode', arguments[0].currentShortcode );
				controller.props.set( 'action', 'update' );
			}

			this.states.add([ controller]);

			this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
			this.on( 'router:create:' + id + '-router', this.createRouter, this );
			this.on( 'router:render:' + id + '-router', _.bind( this.routerRender, this ) );
			this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
			this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
			this.on( 'menu:render:default', this.renderMenuSeparator );

		},

		// Empty because currently there are no other tabs.
		routerRender : function( view ) {},

		contentRender : function( id, tab ) {
			this.content.set(
				new t.view.Shortcode_UI( {
					controller: this,
					className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
				} )
			);
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

		renderMenuSeparator: function( view ) {
			view.set({
				'shortcode-ui-separator': new wp.media.View({
					className: 'separator',
					priority: 65
				})
			});
		},

		insertAction: function() {
			this.controller.state().insert();
		},

	});

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

			var wp_media_frame = wp.media.frames.wp_media_frame = wp.media( {
				frame: "post",
				state: 'shortcode-ui',
				currentShortcode: currentShortcode,
			} );

			wp_media_frame.open();


			// Shortcode_UI.modal.openEditModal( currentShortcode );

		}

	}

	$(document).ready(function(){

		t.shortcodes = new t.collection.Shortcodes( shortcodeUIData.shortcodes )

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