(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var sui = require('./utils/sui.js'),
    editAttributeField = require('./views/edit-attribute-field.js'),
    $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

// Cache attachment IDs for quicker loading.
var iDCache = {};

sui.views.editAttributeFieldAttachment = editAttributeField.extend( {

	render: function() {

		var model = this.model;

		// Set model default values.
		for ( var arg in ShorcakeImageFieldData.defaultArgs ) {
			if ( ! model.get( arg ) ) {
				model.set( arg, ShorcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( model.toJSON() ) );

		var $container    = this.$el.find( '.shortcake-attachment-preview' );
		var $addButton    = $container.find( 'button.add' );
		var $removeButton = $container.find( 'button.remove' );

		var frame = wp.media( {
			multiple: false,
			title: model.get( 'frameTitle' ),
			library: {
				type: model.get( 'libraryType' ),
			},
		} );

		/**
		 * Update the field attachment.
		 * Re-renders UI.
		 * If ID is empty - does nothing.
		 *
		 * @param {int} id Attachment ID
		 */
		var updateAttachment = function( id ) {

			if ( ! id ) {
				return;
			}

			model.set( 'value', id );

			if ( iDCache[ id ] ) {
				renderPreview( iDCache[ id ] );
				return;
			}

			$container.addClass( 'loading' );

			wp.ajax.post( 'get-attachment', {
				'id': id
			} ).done( function( attachment ) {
				// Cache for later.
				iDCache[ id ] = attachment;
				renderPreview( attachment );
				$container.removeClass( 'loading' );
			} );

		}

		/**
		 * Renders attachment preview in field.
		 * @param {object} attachment model
		 * @return null
		 */
		var renderPreview = function( attachment ) {

			var $thumbnail = $('<div class="thumbnail"></div>');

			if ( 'image' !== attachment.type ) {

				$( '<img/>', {
					src: attachment.icon,
					alt: attachment.title,
				} ).appendTo( $thumbnail );

				$( '<div/>', {
					class: 'filename',
					html:  '<div>' + attachment.title + '</div>',
				} ).appendTo( $thumbnail );

			} else {

				$( '<img/>', {
					src:    attachment.sizes.thumbnail.url,
					width:  attachment.sizes.thumbnail.width,
					height: attachment.sizes.thumbnail.height,
					alt:    attachment.alt,
				} ) .appendTo( $thumbnail )

			}

			$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );
			$container.append( $thumbnail );
			$container.toggleClass( 'has-attachment', true );

		}

		/**
		 * Remove the attachment.
		 * Render preview & Update the model.
		 */
		var removeAttachment = function() {

			model.set( 'value', null );

			$container.toggleClass( 'has-attachment', false );
			$container.toggleClass( 'has-attachment', false );
			$container.find( '.thumbnail' ).remove();
		}

		// Add initial Attachment if available.
		updateAttachment( model.get( 'value' ) );

		// Remove file when the button is clicked.
		$removeButton.click( function(e) {
			e.preventDefault();
			removeAttachment();
		});

		// Open media frame when add button is clicked
		$addButton.click( function(e) {
			e.preventDefault();
			frame.open();
		} );

		// Update the attachment when an item is selected.
		frame.on( 'select', function() {

			var selection  = frame.state().get('selection');
			    attachment = selection.first();

			updateAttachment( attachment.id );

			frame.close();

		});

	}

} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils/sui.js":2,"./views/edit-attribute-field.js":3}],2:[function(require,module,exports){

// Globally
window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: {},
	views: {},
};

module.exports = window.Shortcode_UI;

},{}],3:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
sui = require('./../utils/sui.js');

var editAttributeField = Backbone.View.extend( {

	tagName: "div",

	events: {
		'keyup  input[type="text"]':   'updateValue',
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

		if ( this.model.get( 'attr' ) ) {
			var $el = $( this.el ).find( '[name=' + this.model.get( 'attr' ) + ']' );
		} else {
			var $el = $( this.el ).find( '[name="inner_content"]' );
		}

		if ( 'radio' === this.model.attributes.type ) {
			this.model.set( 'value', $el.filter(':checked').first().val() );
		} else if ( 'checkbox' === this.model.attributes.type ) {
			this.model.set( 'value', $el.is( ':checked' ) );
		} else {
			this.model.set( 'value', $el.val() );
		}
	},

} );

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":2}]},{},[1]);
