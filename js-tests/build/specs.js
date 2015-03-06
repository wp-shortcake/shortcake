(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var InnerContent = require('../../js/models/inner-content');

describe( "Shortcode Attribute Model Tests", function() {

	var data = {
		label:       'Inner Content',
		type:        'textarea',
		value:       'test content',
		placeholder: 'test placeholder',
	};

	it( 'should correctly set defaults.', function() {
		var content = new InnerContent();
		expect( content.toJSON() ).toEqual( false );
	});

	it( 'should correctly set data.', function() {
		var content = new InnerContent( data );
		expect( content.toJSON() ).toEqual( data );
	});

} );

},{"../../js/models/inner-content":5}],2:[function(require,module,exports){
var ShortcodeAttribute = require('../../js/models/shortcode-attribute');

describe( "Shortcode Attribute Model Tests", function() {

	var attrData = {
		attr:        'attr',
		label:       'Attribute',
		type:        'text',
		value:       'test value',
		placeholder: 'test placeholder',
	};

	var attr = new ShortcodeAttribute( attrData );

	it( 'should correctly set data.', function() {
		expect( attr.toJSON() ).toEqual( attrData );
	});


} );

},{"../../js/models/shortcode-attribute":6}],3:[function(require,module,exports){
var Shortcode = require('../../js/models/shortcode');
var InnerContent = require('../../js/models/inner-content');
var ShortcodeAttribute = require('../../js/models/shortcode-attribute');
var ShortcodeAttributes = require('../../js/collections/shortcode-attributes');

describe( "Shortcode Model Tests", function() {

	var data = {
		label: 'Test Label',
		shortcode_tag: 'test_shortcode',
		attrs: [
			{
				attr:        'attr',
				label:       'Attribute',
				type:        'text',
				value:       'test value',
				placeholder: 'test placeholder',
			}
		],
		inner_content: {
			value: 'test content',
		},
	};

	var shortcode = new Shortcode( data );

	it( 'Basic Data should be set correctly..', function() {
		expect( shortcode.get( 'label' ) ).toEqual( data.label );
		expect( shortcode.get( 'shortcode_tag' ) ).toEqual( data.shortcode_tag );
	});

	it( 'Attribute data should be set correctly..', function() {
		expect( shortcode.get( 'attrs' ) instanceof ShortcodeAttributes ).toEqual( true );
		expect( shortcode.get( 'attrs' ).length ).toEqual( 1 );
		expect( shortcode.get( 'attrs' ).first().get('type') ).toEqual( data.attrs[0].type );
	});

	it( 'Inner content should be set correctly..', function() {
		expect( shortcode.get( 'inner_content' ) instanceof InnerContent ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( data.inner_content.value );
	});

});

},{"../../js/collections/shortcode-attributes":4,"../../js/models/inner-content":5,"../../js/models/shortcode":7,"../../js/models/shortcode-attribute":6}],4:[function(require,module,exports){
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
},{"./../models/shortcode-attribute.js":6}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : false,
});

module.exports = InnerContent;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		placeholder: '',
	},
});

module.exports = ShortcodeAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var ShortcodeAttributes = require('./../collections/shortcode-attributes.js');
var InnerContent = require('./inner-content.js');

Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: ShortcodeAttributes,
		inner_content: InnerContent,
	},

	/**
	 * Custom set method.
	 * Handles setting the attribute collection.
	 */
	set: function( attributes, options ) {

		if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof ShortcodeAttributes ) ) {
			attributes.attrs = new ShortcodeAttributes( attributes.attrs );
		}

		if ( attributes.inner_content !== undefined && ! ( attributes.inner_content instanceof InnerContent ) ) {
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
		if ( options.attrs !== undefined && ( options.attrs instanceof ShortcodeAttributes ) ) {
			options.attrs = options.attrs.toJSON();
		}
		if ( options.inner_content !== undefined && ( options.inner_content instanceof InnerContent ) ) {
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
		clone.set( 'inner_content', clone.get( 'inner_content' ).clone() );
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

		if ( 'undefined' !== typeof this.get( 'inner_content' ).get( 'value' ) && this.get( 'inner_content' ).get( 'value').length > 0 ) {
			content = this.get( 'inner_content' ).get( 'value' );
		}

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

module.exports = Shortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcode-attributes.js":4,"./inner-content.js":5}]},{},[1,2,3]);
