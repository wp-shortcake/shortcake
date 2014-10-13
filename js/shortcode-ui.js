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
		initialize: function() {
			// this.set( 'action', this.get('action') ? this.get('action') : 'add' );
		},
		openInsertModal: function() {
			frame = new t.view.insertModal.frame( this );
			frame.open();
		},
	});

	// Single Shortcode Model.
	t.model.Shortcode = Backbone.Model.extend({
		defaults: {
			name: '', // Name
			shortcode: '',
			attributes: [
				{ id: 'id', label: 'This is the Label', value: '' }
			]
		},
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
		render: function( data ){

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

		inputValueChanged: function( e ) {
			var $el = $( e.target );
			this.model.set( $el.attr('name'), $el.val() );
		},

		render: function(){

            var view = this.$el.html( this.template( this.model.toJSON() ) );
            var atts = this.model.get( 'attributes' );

            for ( var i = 0; i < atts.length; i++ ) {
            	view.find( '.edit-shortcode-form-fields' ).append( this.singleInputTemplate( atts[i] ) );
            }

            return view;

        }

	});

	t.view.insertModalContent = Backbone.View.extend({

		action: 'add',
		currentShortcode: {},

 		initialize: function(){
            this.render();
        },

        events: {
        	"click .add-shortcode-list li": "selectEditShortcode"
        },

        selectEditShortcode: function() {
        	this.action = 'edit';
        	this.currentShortcode = new t.model.Shortcode;
        	this.render();
        },

        render: function(){

            // @todo for testing.
            this.shortcodes = [
            	{ shortcode: 'test', name: 'Test', image: 'dashicons-carrot' }
            ];

            this.$el.html('');

            switch( this.action ) {
            	case 'add' :
            		this.renderAddShortcodeList();
            		break;
                case 'edit' :
            		this.renderEditShortcodeList( this.currentShortcode );
            		break;
            }

        },

        renderAddShortcodeList: function() {

 			var list = $('<ul class="add-shortcode-list">');

            // @todo for testing.
            this.shortcodes = [
            	{ shortcode: 'test', name: 'Test', image: 'dashicons-carrot' }
            ];

            for ( var i = 0; i < this.shortcodes.length ; i++ ) {
            	var view = new t.view.insertModalListItem();
            	var data = {
        			name:  this.shortcodes[i].name,
        			image: this.shortcodes[i].image
            	};
            	list.append( view.render( data ) );
            };

            this.$el.append( list );

        },

        renderEditShortcodeList: function() {
        	var view = new t.view.editModalListItem( { model: this.currentShortcode } );
        	this.$el.append( view.render() );
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
				events: {
				},

				initialize: function() {

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

					this.modal.$el.addClass('shortcode-ui-insert-modal');

				},

				render: function() {

					var r = wp.media.view.Frame.prototype.render.apply( this, arguments );

					var contentView = new t.view.insertModalContent({
						// model: 'this.lib',
						el: this.$el.find( '.media-frame-content' ).get(0)
					} )

					return r;
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
