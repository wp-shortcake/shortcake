(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var ShortcodeAttribute = require('./../models/shortcode-attribute.js');

/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({
	model : ShortcodeAttribute,
	//  Deep Clone.
	clone : function() {
		return new this.constructor(_.map(this.models, function(m) {
			return m.clone();
		}));
	}
});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode-attribute.js":5}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var Shortcode = require('./../models/shortcode.js');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":6}],3:[function(require,module,exports){
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
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! model.get( arg ) ) {
				model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
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

				attachmentThumb = (typeof attachment.sizes.thumbnail !== 'undefined') ?
					attachment.sizes.thumbnail :
					_.first( _.sortBy( attachment.sizes, 'width' ) );

				$( '<img/>', {
					src:    attachmentThumb.url,
					width:  attachmentThumb.width,
					height: attachmentThumb.height,
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
},{"./utils/sui.js":7,"./views/edit-attribute-field.js":8}],4:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : {
		label:       shortcodeUIData.strings.insert_content_label,
		type:        'textarea',
		value:       '',
		placeholder: '',
	},
});

module.exports = InnerContent;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		meta: {
			placeholder: '',
		},
	},
});

module.exports = ShortcodeAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var ShortcodeAttributes = require('./../collections/shortcode-attributes.js');
var InnerContent = require('./inner-content.js');

Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: new ShortcodeAttributes,
	},

	/**
	 * Custom set method.
	 * Handles setting the attribute collection.
	 */
	set: function( attributes, options ) {

		if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof ShortcodeAttributes ) ) {
			attributes.attrs = new ShortcodeAttributes( attributes.attrs );
		}

		if ( attributes.inner_content && ! ( attributes.inner_content instanceof InnerContent ) ) {
			attributes.inner_content = new InnerContent( attributes.inner_content );
		}

		return Backbone.Model.prototype.set.call(this, attributes, options);
	},

	/**
	 * Custom toJSON.
	 * Handles converting the attribute collection to JSON.
	 */
	toJSON: function( options ) {
		options = Backbone.Model.prototype.toJSON.call(this, options);
		if ( options.attrs && ( options.attrs instanceof ShortcodeAttributes ) ) {
			options.attrs = options.attrs.toJSON();
		}
		if ( options.inner_content && ( options.inner_content instanceof InnerContent ) ) {
			options.inner_content = options.inner_content.toJSON();
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
		if ( clone.get( 'inner_content' ) ) {
			clone.set( 'inner_content', clone.get( 'inner_content' ).clone() );
		}
		return clone;
	},

	/**
	 * Get the shortcode as... a shortcode!
	 *
	 * @return string eg [shortcode attr1=value]
	 */
	formatShortcode: function() {

		var template, shortcodeAttributes, attrs = [], content, self = this;

		this.get( 'attrs' ).each( function( attr ) {

			// Skip empty attributes.
			if ( ! attr.get( 'value' ) ||  attr.get( 'value' ).length < 1 ) {
				return;
			}

			attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );

		} );

		if ( this.get( 'inner_content' ) ) {
			content = this.get( 'inner_content' ).get( 'value' );
		}

		if ( attrs.length > 0 ) {
			template = "[{{ shortcode }} {{ attributes }}]"
		} else {
			template = "[{{ shortcode }}]"
		}

		if ( content && content.length > 0 ) {
			template += "{{ content }}[/{{ shortcode }}]"
		}

		template = template.replace( /{{ shortcode }}/g, this.get('shortcode_tag') );
		template = template.replace( /{{ attributes }}/g, attrs.join( ' ' ) );
		template = template.replace( /{{ content }}/g, content );

		return template;

	}

});

module.exports = Shortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcode-attributes.js":1,"./inner-content.js":4}],7:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes,
	views: {},
	controllers: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":2}],8:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	sui          = require('./../utils/sui.js'),
	$            = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

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

		var data = jQuery.extend( {
			id: 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid,
		}, this.model.toJSON() );

		// Convert meta JSON to attribute string.
		var _meta = [];
		for ( var key in data.meta ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.meta[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.meta[ key ] ) {
					_meta.push( _.escape( key ) );
				}

			} else {

				_meta.push( _.escape( key ) + '="' + _.escape( data.meta[ key ] ) + '"' );

			}

		}

		data.meta = _meta.join( ' ' );

		this.$el.html( this.template( data ) );
		this.updateValue();

		return this
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model. If a callback function is registered
	 * for this attribute, it should be called as well.
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

		var shortcodeName = this.shortcode.attributes.shortcode_tag,
			attributeName = this.model.get( 'attr' ),
			hookName      = [ shortcodeName, attributeName ].join( '.' ),
			changed       = this.model.changed,
			collection    = _.flatten( _.values( this.views.parent.views._views ) ),
			shortcode     = this.shortcode;

		/*
		 * Action run when an attribute value changes on a shortcode
		 *
		 * Called as `{shortcodeName}.{attributeName}`.
		 *
		 * @param changed (object)
		 *           The update, ie. { "changed": "newValue" }
		 * @param viewModels (array)
		 *           The collections of views (editAttributeFields)
		 *                         which make up this shortcode UI form
		 * @param shortcode (object)
		 *           Reference to the shortcode model which this attribute belongs to.
		 */
		wp.shortcake.hooks.doAction( hookName, changed, collection, shortcode );

	}

} );

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":7}]},{},[3]);
