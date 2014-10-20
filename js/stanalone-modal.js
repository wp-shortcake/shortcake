var Shortcode_UI;

( function( $ ) {

	var t = Shortcode_UI;

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

					this.modal.$el.addClass('shortcode-ui-insert')

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

					this.$contentEl.append(
						new t.view.insertShortcodeList( { shortcodes: t.shortcodes } ).render().el
					);
				},

				renderEditShortcodeForm: function() {
					var view = new t.view.shortcodeEditForm( {
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

	$(document).ready(function(){

		t.modal      = new t.model.Shortcode_UI( shortcodeUIData.modalOptions );

		$('.shortcode-editor-open-insert-modal').click( function(e) {
			e && e.preventDefault();
			t.modal.openInsertModal();
		});

	});

} )( jQuery );