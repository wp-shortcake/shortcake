var Shortcode_UI;

( function( $ ) {

jQuery(document).ready(function(){

	var t = Shortcode_UI = this;

	t.model = {};
	t.collection = {};
	t.view = {};

	// Controller Model
	t.model.Shortcode_UI = Backbone.Model.extend({
		_this: this,
		openInsertModal: function() {
			frame = new t.view.insertModal.frame( this );
			frame.open();
		},
	});

	t.model.ShortcodeAtts = Backbone.Model.extend({
		defaults: {
			label: '',
			id: '',
			value: '',
		},
	});

	t.collection.ShortcodeAtts = Backbone.Collection.extend({
		model: t.model.ShortcodeAtts
	});

	// Single Shortcode Model.
	t.model.Shortcode = Backbone.Model.extend({

		defaults: {
			label: '',
			shortcode: '',
			shortcodeAtts: new t.model.ShortcodeAtts,
			content: '',
		},

		/**
		 * Custom set method
		 * Used to set shortcodeAtts collection.
		 */
		set: function( attributes, options ) {

			if ( ( 'shortcodeAtts' in attributes ) && ! ( attributes.shortcodeAtts instanceof t.collection.ShortcodeAtts ) ) {
				attributes.shortcodeAtts = new t.collection.ShortcodeAtts( attributes.shortcodeAtts );
			}

			return Backbone.Model.prototype.set.call( this, attributes, options );

		},

		formatShortcode: function() {

			var template, atts = [];

			this.get( 'shortcodeAtts' ).each( function( attribute ) {
				atts.push( attribute.get('id') + '="' + attribute.get('value') + '"' );
			} );

			var content = this.get( 'content' );

			if ( content && content.length > 1 ) {
				template = "[{{shortcode}} {{attributes}}]{{content}}[/{{shortcode}}]"
			} else {
				template = "[{{shortcode}} {{attributes}}]"
			}

			template = template.replace( /{{shortcode}}/g, this.get('shortcode') );
			template = template.replace( /{{attributes}}/g, atts.join( ' ' ) );
			template = template.replace( /{{content}}/g, content );

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

			this.$el.attr( 'data-shortcode', data.shortcode );

			if ( ( 'image' in data ) && 0 === data.image.indexOf( 'dashicons-' ) ) {
				data.image = '<div class="dashicons ' + data.image + '"></div>';
			}

            return this.$el.html( this.template( data ) );
        }
	});

	/**
	 * Single edit shortcode content view.
	 * Used for add/edit shortcode modal.
	 */
	t.view.editModalListItem = Backbone.View.extend({

		template:  wp.template('edit-shortcode-content-default'),
		singleInputTemplate:  wp.template('edit-shortcode-content-default-single-input'),

		events: {
			'keyup .edit-shortcode-form-fields input[type=text]': 'inputValueChanged'
		},

		inputValueChanged: _.debounce( function( e ) {
			var $el = $( e.target );
			var attribute  = this.model.get('shortcodeAtts').findWhere( { id: $el.attr('name') } );
			attribute.set( 'value', $el.val() );
		}, 500 ),

		render: function(){

			var t = this;
            var view = this.$el.html( this.template( this.model.toJSON() ) );

            this.model.get( 'shortcodeAtts' ).each( function( attribute ) {
            	console.log( attribute.toJSON() );
            	view.find( '.edit-shortcode-form-fields' ).append(
            		'<div>' + t.singleInputTemplate( attribute.toJSON() ) + '</div>'
            	);
            } );

            return view;

        }

	});

	t.view.insertModal = {

		frame: function( delegate ) {

			if ( this._frame )
				return this._frame;

			var _frame = wp.media.view.Frame.extend({

				className: 'media-frame',
				template:  wp.media.template('shortcode-ui-media-frame'),
				model: delegate,
				action: 'add',
				events: {
					"click .add-shortcode-list li": "selectEditShortcode",
					"click .media-button-insert": "insertShortcode",
					"submit .edit-shortcode-form": "insertShortcode",
				},

				action: 'add',
				currentShortcode: {},


				initialize: function() {

					// Set Shortcodes
		            this.shortcodes = new t.collection.Shortcodes( shortcodeUIData.shortcodes )

					this.options = this.model.attributes;
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

					switch( this.action ) {
						case 'add' :
							this.renderAddShortcodeList();
							break;
						case 'edit' :
						case 'update' :
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
		        	var view = new t.view.editModalListItem( { model: this.currentShortcode } );
		        	this.$contentEl.append( view.render() );
		        },

		        // @todo make this nicer.
		        renderFooter: function() {

		        	var toolbar = $( '<div class="media-toolbar" />' );
		        	var el = $( '<div class="media-toolbar-primary" />' );
		        	var buttonSubmit = $('<button href="#" class="button media-button button-primary button-large media-button-insert" disabled="disabled">Insert into post</button>');

		        	buttonSubmit.appendTo( el );
		        	el.appendTo( toolbar );
		        	toolbar.appendTo( this.$toolbarEl );

					switch( this.action ) {
		            	case 'add' :
		            		buttonSubmit.attr( 'disabled', 'disabled' );
		            		break;
		                case 'edit' :
		                case 'update' :
		                	buttonSubmit.removeAttr( 'disabled' );
		            		break;
		            }

		        },

		        selectEditShortcode: function(e) {

		        	this.action = 'edit';
		        	var target    = $(e.currentTarget).closest( '.shortcode-list-item' );
		        	var shortcode = target.attr( 'data-shortcode' );
		        	this.currentShortcode = this.shortcodes.findWhere( { shortcode: shortcode } ).clone();
					this.render();

		        },

		        insertShortcode: function() {
		        	send_to_editor( '<p>' + this.currentShortcode.formatShortcode() + '<p>' );
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

	var modal = new t.model.Shortcode_UI( shortcodeUIData.modalOptions );

	jQuery('.shortcode-editor-open-insert-modal').click( function(e) {
		e && e.preventDefault();
		modal.openInsertModal();
	});

});



} )( jQuery );
