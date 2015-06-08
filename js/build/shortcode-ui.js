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
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
    wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
    sui = require('./../utils/sui.js'),
    Shortcodes = require('./../collections/shortcodes.js');

var MediaController = wp.media.controller.State.extend({

	initialize: function(){

		this.props = new Backbone.Model({
			currentShortcode: null,
			action: 'select',
			search: null
		});

		this.props.on( 'change:action', this.refresh, this );

	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	search: function( searchTerm ) {
		var pattern = new RegExp( searchTerm, "gi" );
		var filteredModels = sui.shortcodes.filter( function( model ) {
			return pattern.test( model.get( "label" ) );
		});
		return filteredModels;
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
		this.props.set( 'search', null );
	},

});

sui.controllers.MediaController = MediaController;
module.exports = MediaController;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcodes.js":2,"./../utils/sui.js":9}],4:[function(require,module,exports){
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
(function (global){
var sui = require('./utils/sui.js'),
	Shortcodes = require('./collections/shortcodes.js'),
	shortcodeViewConstructor = require('./utils/shortcode-view-constructor.js'),
	mediaFrame = require('./views/media-frame.js'),
	wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
	$ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

$(document).ready(function(){

	// Create collection of shortcode models from data.
	sui.shortcodes.add( shortcodeUIData.shortcodes );

	wp.media.view.MediaFrame.Post = mediaFrame;

	// Register a view for each shortcode.
	sui.shortcodes.each( function( shortcode ) {
		if ( wp.mce.views ) {
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				// Must extend for 4.1.
				// This is handled by wp.mce.views.register in 4.2.
				$.extend( true, {}, shortcodeViewConstructor )
			);
		}
	} );

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./collections/shortcodes.js":2,"./utils/shortcode-view-constructor.js":8,"./utils/sui.js":9,"./views/media-frame.js":14}],8:[function(require,module,exports){
(function (global){
var sui = require('./sui.js'),
    wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
    $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

/**
 * Generic shortcode mce view constructor.
 * This is cloned and used by each shortcode when registering a view.
 */
var shortcodeViewConstructor = {

	initialize: function( options ) {
		this.shortcodeModel = this.getShortcodeModel( this.shortcode );
		this.fetch();
	},

	/**
	 * Get the shortcode model given the view shortcode options.
	 * Must be a registered shortcode (see sui.shortcodes)
	 */
	getShortcodeModel: function( options ) {

		var shortcodeModel;

		shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.tag } );

		if ( ! shortcodeModel ) {
			return;
		}

		shortcodeModel = shortcodeModel.clone();

		shortcodeModel.get('attrs').each(
			function( attr ) {
				if ( attr.get('attr') in options.attrs.named ) {
					attr.set(
						'value',
						options.attrs.named[ attr.get('attr') ]
					);
				}
			}
		);

		if ( 'content' in options ) {
			var innerContent = shortcodeModel.get('inner_content');
			if ( innerContent ) {
				innerContent.set('value', options.content)
			}
		}

		return shortcodeModel;

	},

	/**
	 * Fetch preview.
	 * Async. Sets this.content and calls this.render.
	 *
	 * @return undefined
	 */
	fetch : function() {

		var self = this;

		if ( ! this.fetching ) {

			this.fetching = true;

			wp.ajax.post( 'do_shortcode', {
				post_id: $( '#post_ID' ).val(),
				shortcode: this.shortcodeModel.formatShortcode(),
				nonce: shortcodeUIData.nonces.preview,
			}).done( function( response ) {

				if ( '' === response ) {
					self.content = '<span class="shortcake-notice shortcake-empty">' + self.shortcodeModel.formatShortcode() + '</span>';
				} else {
					self.content = response;
				}

			}).fail( function() {
				self.content = '<span class="shortcake-error">' + shortcodeUIData.strings.mce_view_error + '</span>';
			} ).always( function() {
				delete self.fetching;
				self.render( null, true );
			} );

		}

	},

	/**
	 * Edit shortcode.
	 * Get shortcode model and open edit modal.
	 *
	 */
	edit : function( shortcodeString ) {

		var currentShortcode;

		// Backwards compatability for WP pre-4.2
		if ( 'object' === typeof( shortcodeString ) ) {
			shortcodeString = decodeURIComponent( $(shortcodeString).attr('data-wpview-text') );
		}

		currentShortcode = this.parseShortcodeString( shortcodeString );

		if ( currentShortcode ) {

			var wp_media_frame = wp.media.frames.wp_media_frame = wp.media({
				frame : "post",
				state : 'shortcode-ui',
				currentShortcode : currentShortcode,
			});

			wp_media_frame.open();

		}

	},

	/**
	 * Parse a shortcode string and return shortcode model.
	 * Must be a registered shortcode - see window.Shortcode_UI.shortcodes.
	 *
	 * @todo - I think there must be a cleaner way to get the
	 * shortcode & args here that doesn't use regex.
	 *
	 * @param  string shortcodeString
	 * @return Shortcode
	 */
	parseShortcodeString: function( shortcodeString ) {

		var model, attr;

		var megaRegex = /\[([^\s\]]+)([^\]]+)?\]([^\[]*)?(\[\/(\S+?)\])?/;
		var matches = shortcodeString.match( megaRegex );

		if ( ! matches ) {
			return;
		}

		defaultShortcode = sui.shortcodes.findWhere({
			shortcode_tag : matches[1]
		});

		if ( ! defaultShortcode ) {
			return;
		}

		currentShortcode = defaultShortcode.clone();

		if ( matches[2] ) {

			var attributeRegex = /(\w+)\s*=\s*"([^"]*)"(?:\s|$)|(\w+)\s*=\s*\'([^\']*)\'(?:\s|$)|(\w+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|(\S+)(?:\s|$)/gmi;
			attributeMatches   = matches[2].match( attributeRegex ) || [];

			// Trim whitespace from matches.
			attributeMatches = attributeMatches.map( function( match ) {
				return match.replace( /^\s+|\s+$/g, '' );
			} );

			// convert attribute strings to object.
			for ( var i = 0; i < attributeMatches.length; i++ ) {

				var bitsRegEx = /(\S+?)=(.*)/g;
				var bits = bitsRegEx.exec( attributeMatches[i] );

				if ( bits && bits[1] ) {

					attr = currentShortcode.get( 'attrs' ).findWhere({
						attr : bits[1]
					});

					// If attribute found - set value.
					// Trim quotes from beginning and end.
					if ( attr ) {
						attr.set( 'value', bits[2].replace( /^"|^'|"$|'$/gmi, "" ) );
					}

				}
			}

		}

		if ( matches[3] ) {
			var inner_content = currentShortcode.get( 'inner_content' );
			inner_content.set( 'value', this.unAutoP( matches[3] ) );
		}

		return currentShortcode;

	},

 	/**
	 * Strip 'p' and 'br' tags, replace with line breaks.
	 * Reverse the effect of the WP editor autop functionality.
	 */
	unAutoP: function( content ) {
		if ( switchEditors && switchEditors.pre_wpautop ) {
			content = switchEditors.pre_wpautop( content );
		}

		return content;

	},

	// Backwards compatability for Pre WP 4.2.
	View: {

		overlay: true,

		initialize: function( options ) {
			this.shortcode = this.getShortcode( options );
			this.fetch();
		},

		getShortcode: function( options ) {

			var shortcodeModel, shortcode;

			shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.shortcode.tag } );

			if (!shortcodeModel) {
				return;
			}

			shortcode = shortcodeModel.clone();

			shortcode.get('attrs').each(
					function(attr) {

						if (attr.get('attr') in options.shortcode.attrs.named) {
							attr.set('value',
									options.shortcode.attrs.named[attr
											.get('attr')]);
						}

					});

			if ('content' in options.shortcode) {
				var inner_content = shortcode.get('inner_content');
				if ( inner_content ) {
					inner_content.set('value', options.shortcode.content)
				}
			}

			return shortcode;

		},

		fetch : function() {

			var self = this;

			if ( ! this.parsed ) {

				wp.ajax.post( 'do_shortcode', {
					post_id: $( '#post_ID' ).val(),
					shortcode: this.shortcode.formatShortcode(),
					nonce: shortcodeUIData.nonces.preview,
				}).done( function( response ) {
					if ( response.indexOf( '<script' ) !== -1 ) {
						self.setIframes( self.getEditorStyles(), response );
					} else {
						self.parsed = response;
						self.render( true );
					}
				}).fail( function() {
					self.parsed = '<span class="shortcake-error">' + shortcodeUIData.strings.mce_view_error + '</span>';
					self.render( true );
				} );

			}

		},

		/**
		 * Render the shortcode
		 *
		 * To ensure consistent rendering - this makes an ajax request to the
		 * admin and displays.
		 *
		 * @return string html
		 */
		getHtml : function() {
			return this.parsed;
		},

		/**
		 * Returns an array of <link> tags for stylesheets applied to the TinyMCE editor.
		 *
		 * @method getEditorStyles
		 * @returns {Array}
		 */
		getEditorStyles: function() {

			var styles = '';

			this.getNodes( function ( editor, node, content ) {
				var dom = editor.dom,
					bodyClasses = editor.getBody().className || '',
					iframe, iframeDoc, i, resize;

				tinymce.each( dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
					if ( link.href && link.href.indexOf( 'skins/lightgray/content.min.css' ) === -1 &&
						link.href.indexOf( 'skins/wordpress/wp-content.css' ) === -1 ) {

						styles += dom.getOuterHTML( link ) + '\n';
					}

				});

			} );

			return styles;
		},

	},

};

module.exports = shortcodeViewConstructor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./sui.js":9}],9:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes,
	views: {},
	controllers: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":2}],10:[function(require,module,exports){
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
},{"./../utils/sui.js":9}],11:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
sui = require('./../utils/sui.js'),
backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
editAttributeField = require('./edit-attribute-field.js');

/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template: wp.template('shortcode-default-edit-form'),

	initialize: function() {

		var t = this;

		var innerContent = this.model.get( 'inner_content' );
		if ( innerContent && typeof innerContent.attributes.type !== 'undefined' ) {

			// add UI for inner_content
			var view = new editAttributeField( { model: innerContent } );

			view.shortcode = t.model;
			view.template  = wp.media.template( 'shortcode-ui-content' );

			t.views.add( '.edit-shortcode-form-fields', view );

		}

		this.model.get( 'attrs' ).each( function( attr ) {

			// Get the field settings from localization data.
			var type = attr.get('type');

			if ( ! shortcodeUIFieldData[ type ] ) {
				return;
			}

			var templateData = {
				value: attr.get('value'),
				attr_raw: {
					name: attr.get('value')
				}
			}

			var viewObjName = shortcodeUIFieldData[ type ].view;
			var tmplName    = shortcodeUIFieldData[ type ].template;

			var view       = new sui.views[viewObjName]( { model: attr } );
			view.template  = wp.media.template( tmplName );
			view.shortcode = t.model;

			t.views.add( '.edit-shortcode-form-fields', view );

		} );

		if ( 0 == this.model.get( 'attrs' ).length && ( ! innerContent || typeof innerContent == 'undefined' ) ) {
			var messageView = new Backbone.View({
				tagName:      'div',
				className:    'notice updated',
			});
			messageView.render = function() {
				this.$el.append( '<p>' );
				this.$el.find('p').text( shortcodeUIData.strings.media_frame_no_attributes_message );
				return this;
			};
			t.views.add( '.edit-shortcode-form-fields', messageView );
		}

	},

});

module.exports = EditShortcodeForm;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":9,"./edit-attribute-field.js":10}],12:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);

/**
 * Single shortcode list item view.
 */
var insertShortcodeListItem = wp.Backbone.View.extend({

	tagName : 'li',
	template : wp.template('add-shortcode-list-item'),
	className : 'shortcode-list-item',

	render : function() {

		var data = this.model.toJSON();
		this.$el.attr('data-shortcode', data.shortcode_tag);

		if (('listItemImage' in data)
				&& 0 === data.listItemImage.indexOf('dashicons-')) {
			data.listItemImage = '<div class="dashicons ' + data.listItemImage
					+ '"></div>';
		}

		this.$el.html(this.template(data));

		return this;

	}
});

module.exports = insertShortcodeListItem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var Shortcodes = require('./../collections/shortcodes.js');
var insertShortcodeListItem = require('./insert-shortcode-list-item.js');

var insertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function( options ) {

		this.displayShortcodes( options );

	},
	
	refresh: function( shortcodeData ) {
		if ( shortcodeData instanceof Backbone.Collection ) {
			var options = { shortcodes: shortcodeData };
		} else {
			var options = { shortcodes: new Shortcodes( shortcodeData ) };
		}
		this.displayShortcodes( options );
	},
	
	displayShortcodes: function(options) {
		var t = this;
		
		t.$el.find('.add-shortcode-list').html('');
		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new insertShortcodeListItem({
				model : shortcode
			}));
		});
	}

});

module.exports = insertShortcodeList;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcodes.js":2,"./insert-shortcode-list-item.js":12}],14:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
	$ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null),
	MediaController = require('./../controllers/media-controller.js'),
	Shortcode_UI = require('./shortcode-ui'),
	Toolbar = require('./media-toolbar');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

	initialize: function() {

		postMediaFrame.prototype.initialize.apply( this, arguments );

		var id = 'shortcode-ui';

		var opts = {
			id      : id,
			search  : true,
			router  : false,
			toolbar : id + '-toolbar',
			menu    : 'default',
			title   : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs    : [ 'insert' ],
			priority:  66,
			content : id + '-content-insert',
		};

		if ( 'currentShortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace( /%s/, this.options.currentShortcode.attributes.label );
		}

		this.mediaController = new MediaController( opts );

		if ( 'currentShortcode' in this.options ) {
			this.mediaController.props.set( 'currentShortcode', arguments[0].currentShortcode );
			this.mediaController.props.set( 'action', 'update' );
		}

		this.states.add([ this.mediaController ]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	events: function() {
		return _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item'    : 'resetMediaController',
		} );
	},

	resetMediaController: function( event ) {
		if ( this.state() && this.state().props.get('currentShortcode') ) {
			this.mediaController.reset();
			this.contentRender( 'shortcode-ui', 'insert' );
		}
	},

	contentRender : function( id, tab ) {
		this.content.set(
			new Shortcode_UI( {
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

		toolbar.view = new  Toolbar( {
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

} );

module.exports = mediaFrame;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../controllers/media-controller.js":3,"./media-toolbar":15,"./shortcode-ui":18}],15:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);

/**
 * Toolbar view that extends wp.media.view.Toolbar
 * to define cusotm refresh method
 */
var Toolbar = wp.media.view.Toolbar.extend({
	initialize : function() {
		_.defaults(this.options, {
			requires : false
		});
		// Call 'initialize' directly on the parent class.
		wp.media.view.Toolbar.prototype.initialize.apply(this, arguments);
	},

	refresh : function() {
		var action = this.controller.state().props.get('action');
		if( this.get('insert') ) {
			this.get('insert').model.set('disabled', action == 'select');
		}
		/**
		 * call 'refresh' directly on the parent class
		 */
		wp.media.view.Toolbar.prototype.refresh.apply(this, arguments);
	}
});

module.exports = Toolbar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],16:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);
sui = require('./../utils/sui.js');

var SearchShortcode = wp.media.view.Search.extend({
	tagName:   'input',
	className: 'search',
	id:        'media-search-input',
	
	initialize: function( options ) {
		this.shortcodeList = options.shortcodeList;
	}, 

	attributes: {
		type:        'search',
		placeholder: shortcodeUIData.strings.search_placeholder
	},

	events: {
		'keyup':  'search',
	},

	/**
	 * @returns {wp.media.view.Search} Returns itself to allow chaining
	 */
	render: function() {
		this.el.value = this.model.escape('search');
		return this;
	},
	
	refreshShortcodes: function( shortcodeData ) {
		this.shortcodeList.refresh( shortcodeData );
	},

	search: function( event ) {
		if ( event.target.value == '' ) {
			this.refreshShortcodes( sui.shortcodes );
		} else {
			this.refreshShortcodes( this.controller.search( event.target.value ) );
		}
	}
});

sui.views.SearchShortcode = SearchShortcode;
module.exports = SearchShortcode;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":9}],17:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
    $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

/**
 * Preview of rendered shortcode.
 * Asynchronously fetches rendered shortcode content from WordPress.
 * Displayed in an iframe to isolate editor styles.
 *
 * @class ShortcodePreview
 * @constructor
 * @params options
 * @params options.model {Shortcode} Requires a valid shortcode.
 */
var ShortcodePreview = Backbone.View.extend({
	initialize: function( options ) {
		this.head = this.getEditorStyles().join( "\n" );
	},

	getLoading: function() {
		return '<div class="loading-placeholder">' +
			'<div class="dashicons dashicons-admin-media"></div>' +
			'<div class="wpview-loading"><ins></ins></div>' +
		'</div>';
	},

	/**
	 * @method render
	 * @chainable
	 * @returns {ShortcodePreview}
	 */
	render: function() {

		var self = this;

		// Render loading iFrame.
		this.renderIFrame({
			head: self.head,
			body: self.getLoading(),
		});

		// Fetch shortcode preview.
		// Render iFrame with shortcode preview.
		this.fetchShortcode( function( response ) {
			self.renderIFrame({
				head: self.head,
				body: response,
			});
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

		var self = this, $iframe, resize;

		_.defaults( params || {}, { 'head': '', 'body': '', 'body_classes': 'shortcake shortcake-preview' });

		var isIE = typeof tinymce != 'undefined' ? tinymce.Env.ie : false;

		$iframe = $( '<iframe/>', {
			src: isIE ? 'javascript:""' : '',
			frameBorder: '0',
			allowTransparency: 'true',
			scrolling: 'no',
			style: "width: 100%; display: block",
		} );

		/**
		 * Render preview in iFrame once loaded.
		 * This is required because you can't write to
		 * an iFrame contents before it exists.
		 */
		$iframe.load( function() {

			self.autoresizeIframe( $(this) );

			var head = $(this).contents().find('head'),
			    body = $(this).contents().find('body');

			head.html( params.head );
			body.html( params.body );
			body.addClass( params.body_classes );

		} );

		this.$el.html( $iframe );

	},

	/**
	 * Watch for mutations in iFrame content.
	 * resize iFrame height on change.
	 *
	 * @param  $ object $iframe
	 */
	autoresizeIframe: function( $iframe ) {

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

		// Resize iFrame to size inner document.
		var resize = function() {
			$iframe.height( $iframe.contents().find('html').height() );
		};

		resize();

		if ( MutationObserver ) {

			var observer = new MutationObserver( function() {
				resize();
				$iframe.contents().find('img,link').load( resize );
			} );

			observer.observe(
				$iframe.contents()[0],
				{ attributes: true, childList: true, subtree: true }
			);

		} else {

			for ( i = 1; i < 6; i++ ) {
				setTimeout( resize, i * 700 );
			}

		}

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

		var editors = typeof tinymce != 'undefined' ? tinymce.editors : [];
		_.each( editors, function( editor ) {
			_.each( editor.dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
				var href;
				( href = link.href ) && ( styles[href] = true );	// Poor man's de-duping.
			});
		});

		styles = _.map( _.keys( styles ), function( href ) {
			return $( '<link rel="stylesheet" type="text/css">' ).attr( 'href', href )[0].outerHTML;
		});

		return styles;
	}
});

module.exports = ShortcodePreview;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],18:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	insertShortcodeList = require('./insert-shortcode-list.js'),
	TabbedView = require('./tabbed-view.js'),
	ShortcodePreview = require('./shortcode-preview.js'),
	EditShortcodeForm = require('./edit-shortcode-form.js'),
	Toolbar = require('./media-toolbar.js'),
	SearchShortcode = require('./search-shortcode.js'),
	sui = require('./../utils/sui.js'),
	$ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":9,"./edit-shortcode-form.js":11,"./insert-shortcode-list.js":13,"./media-toolbar.js":15,"./search-shortcode.js":16,"./shortcode-preview.js":17,"./tabbed-view.js":19}],19:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var sui = require('./../utils/sui.js');
var $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

/**
 * Abstraction to manage tabbed content. Tab parameters (e.g., label) along with
 * views for associated content are passed to initialize the tabbed view.
 *
 * @class TabbedView
 * @constructor
 * @extends Backbone.View
 * @params [options]
 * @params [options.tabs] {Object} A hash of key:value pairs, where each value
 *         is itself an object with the following properties:
 *
 * label: The label to display on the tab. content: The `Backbone.View`
 * associated with the tab content.
 */
var TabbedView = Backbone.View.extend({
	template : wp.template('tabbed-view-base'),
	tabs : {},

	events : {
		'click [data-role="tab"]' : function(event) {
			this.tabSwitcher(event);
		}
	},

	initialize : function(options) {
		Backbone.View.prototype.initialize.apply(this, arguments);

		_.defaults(this.options = (options || {}), {
			styles : {
				group : '',
				tab : ''
			}
		});

		this.tabs = _.extend(this.tabs, options.tabs);
	},

	/**
	 * @method render
	 * @chainable
	 * @returns {TabbedView}
	 */
	render : function() {
		var $content;

		this.$el.html(this.template({
			tabs : this.tabs,
			styles : this.options.styles
		}));

		$content = this.$('[data-role="tab-content"]');
		$content.empty();

		_.each(this.tabs, function(tab) {
			var $el = tab.content.render().$el;
			$el.hide();
			$content.append($el);
		});

		this.select(0);

		return this;
	},

	/**
	 * Switches tab when previewing or editing
	 */
	tabSwitcher : function(event) {
		event.stopPropagation();
		event.preventDefault();

		var target = $(event.currentTarget).attr('data-target');

		this.select(target);
	},

	/**
	 * Programmatically select (activate) a specific tab. Used internally to
	 * process tab click events.
	 *
	 * @method select
	 * @param selector
	 *            {number|string} The index (zero based) or key of the target
	 *            tab.
	 */
	select : function(selector) {
		var index = 0;
		var target = null;
		var tab;

		selector = selector || 0;

		_.each(this.tabs, function(tab, key) {
			tab.content.$el.hide();

			if (selector === key || selector === index) {
				target = key;
			}

			index = index + 1;
		});

		this.$('[data-role="tab"]').removeClass('active');

		if (target) {
			tab = this.tabs[target];

			this.$('[data-role="tab"][data-target="' + target + '"]').addClass(
					'active');

			tab.content.$el.show();
			(typeof tab.open == 'function') && tab.open.call(tab.content);
		}
	}
});

sui.views.TabbedView = TabbedView;
module.exports = TabbedView;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":9}]},{},[7]);
