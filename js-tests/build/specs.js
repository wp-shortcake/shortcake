(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var InnerContent = require('../../js/src/models/inner-content');

describe( "Shortcode Inner Content Model", function() {

	var data = {
		label:       'Inner Content',
		type:        'textarea',
		value:       'test content',
		placeholder: 'test placeholder',
	};

	it( 'sets defaults correctly.', function() {
		var content = new InnerContent();
		expect( content.toJSON() ).toEqual( {
			label:       'Inner Content',
			type:        'textarea',
			value:       '',
			placeholder: '',
		} );
	});

	it( 'sets data correctly.', function() {
		var content = new InnerContent( data );
		expect( content.toJSON() ).toEqual( data );
	});

} );

},{"../../js/src/models/inner-content":8}],2:[function(require,module,exports){
var ShortcodeAttribute = require('../../js/src/models/shortcode-attribute');

describe( "Shortcode Attribute Model", function() {

	var attrData = {
		attr:        'attr',
		label:       'Attribute',
		type:        'text',
		value:       'test value',
		description: 'test description',
		meta:  {
			placeholder: 'test placeholder'
		},
	};

	var attr = new ShortcodeAttribute( attrData );

	it( 'should correctly set data.', function() {
		expect( attr.toJSON() ).toEqual( attrData );
	});


} );

},{"../../js/src/models/shortcode-attribute":9}],3:[function(require,module,exports){
(function (global){
var Shortcode = require('../../js/src/models/shortcode');
var InnerContent = require('../../js/src/models/inner-content');
var ShortcodeAttribute = require('../../js/src/models/shortcode-attribute');
var ShortcodeAttributes = require('../../js/src/collections/shortcode-attributes');
var $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

describe( "Shortcode Model", function() {

	var defaultShortcode, shortcode, data;

	data = {
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

	var defaultShortcode = new Shortcode();
	var shortcode = new Shortcode( data );

	it( 'Defaults set correctly.', function() {
		expect( defaultShortcode.get( 'label' ) ).toEqual( '' );
		expect( defaultShortcode.get( 'shortcode_tag' ) ).toEqual( '' );
		expect( defaultShortcode.get( 'attrs' ) instanceof ShortcodeAttributes ).toEqual( true );
		expect( defaultShortcode.get( 'attrs' ).length ).toEqual( 0 );
		expect( defaultShortcode.get( 'inner_content' ) ).toEqual( undefined );
	});

	it( 'Attribute data set correctly..', function() {
		expect( shortcode.get( 'attrs' ) instanceof ShortcodeAttributes ).toEqual( true );
		expect( shortcode.get( 'attrs' ).length ).toEqual( 1 );
		expect( shortcode.get( 'attrs' ).first().get('type') ).toEqual( data.attrs[0].type );
	});

	it( 'Inner content set correctly..', function() {
		expect( shortcode.get( 'inner_content' ) instanceof InnerContent ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( data.inner_content.value );
	});

	it( 'Converted to JSON correctly.', function() {
		var json = shortcode.toJSON();
		expect( json.label ).toEqual( data.label );
		expect( json.attrs[0].label ).toEqual( data.attrs[0].label );
	});

	it( 'Format shortcode.', function() {

		var _shortcode = jQuery.extend( true, {}, shortcode );

		// Test with attribute and with content.
		expect( _shortcode.formatShortcode() ).toEqual( '[test_shortcode attr="test value"]test content[/test_shortcode]' );

		// Test without content.
		_shortcode.get('inner_content').unset( 'value' );
		expect( _shortcode.formatShortcode() ).toEqual( '[test_shortcode attr="test value"]' );

		// Test without attributes
		_shortcode.get( 'attrs' ).first().unset( 'value' );
		expect( _shortcode.formatShortcode() ).toEqual( '[test_shortcode]' );

	});

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../js/src/collections/shortcode-attributes":6,"../../js/src/models/inner-content":8,"../../js/src/models/shortcode":10,"../../js/src/models/shortcode-attribute":9}],4:[function(require,module,exports){
(function (global){
var Shortcode = require('./../../../js/src/models/shortcode.js');
var MceViewConstructor = require('./../../../js/src/utils/shortcode-view-constructor.js');
var sui = require('./../../../js/src/utils/sui.js');
var jQuery = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);

describe( "MCE View Constructor", function() {

	sui.shortcodes.push( new Shortcode( {
		label: 'Test Label',
		shortcode_tag: 'test_shortcode',
		attrs: [
			{
				attr:        'attr',
				label:       'Attribute',
			}
		],
		inner_content: {
			value: 'test content',
		},
	} ) );

	sui.shortcodes.push( new Shortcode( {
		label: 'Test shortcode with dash',
		shortcode_tag: 'test-shortcode',
		attrs: [
			{
				attr:        'test-attr',
				label:       'Test attribute with dash',
			}
		],
		inner_content: {
			value: 'test content',
		},
	} ) );

	it ( 'test get shortcode model', function() {

		var constructor = jQuery.extend( true, {}, MceViewConstructor );

		constructor.shortcode = {
			tag: "test_shortcode",
			attrs: {
				named: {
					attr: "Vestibulum ante ipsum primis"
				},
			},
			content: "Mauris iaculis porttitor posuere."
		};

		constructor.shortcodeModel = constructor.getShortcodeModel( constructor.shortcode );
		expect( constructor.shortcodeModel instanceof Shortcode ).toEqual( true );
		expect( constructor.shortcodeModel.get( 'attrs' ).first().get( 'value' ) ).toEqual( 'Vestibulum ante ipsum primis' );
		expect( constructor.shortcodeModel.get( 'inner_content' ).get( 'value' ) ).toEqual( 'Mauris iaculis porttitor posuere.' );

	} );

	describe( "Fetch preview HTML", function() {

		beforeEach(function() {
			jasmine.Ajax.install();
		});

		afterEach(function() {
			jasmine.Ajax.uninstall();
		});

		var constructor = jQuery.extend( true, {
			render: function( force ) {},
		}, MceViewConstructor );

		// Mock shortcode model data.
		constructor.shortcodeModel = jQuery.extend( true, {}, sui.shortcodes.first() );

		it( 'Fetches data success', function(){

			spyOn( wp.ajax, "post" ).and.callThrough();
			spyOn( constructor, "render" );

			constructor.fetch();

			expect( constructor.fetching ).toEqual( true );
			expect( constructor.content ).toEqual( undefined );
			expect( wp.ajax.post ).toHaveBeenCalled();
			expect( constructor.render ).not.toHaveBeenCalled();

			jasmine.Ajax.requests.mostRecent().respondWith( {
				'status': 200,
				'responseText': '{"success":true,"data":"test preview response body"}'
			} );

			expect( constructor.fetching ).toEqual( undefined );
			expect( constructor.content ).toEqual( 'test preview response body' );
			expect( constructor.render ).toHaveBeenCalled();

		});

		it( 'Handles errors when fetching data', function() {

			spyOn( constructor, "render" );

			constructor.fetch();

			jasmine.Ajax.requests.mostRecent().respondWith( {
				'status': 500,
				'responseText': '{"success":false}'
			});

			expect( constructor.fetching ).toEqual( undefined );
			expect( constructor.content ).toContain( 'shortcake-error' );
			expect( constructor.render ).toHaveBeenCalled();

		} );

	} );

	it( 'parses simple shortcode', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test_shortcode attr="test value"]')
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test value' );
	});

	it( 'parses shortcode with content', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test_shortcode attr="test value 1"]test content[/test_shortcode]')
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test value 1' );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( 'test content' );
	});

	it( 'parses shortcode with dashes in name and attribute', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test-shortcode test-attr="test value 2"]')
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'test-attr' }).get('value') ).not.toEqual( 'test value 2' );
	});

	// https://github.com/fusioneng/Shortcake/issues/171
	it( 'parses shortcode with line breaks in inner content', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( "[test_shortcode]test \ntest \rtest[/test_shortcode]")
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( "test \ntest \rtest" );
	} );

	it( 'parses shortcode with paragraph and br tags in inner content', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( "[test_shortcode]<p>test</p><p>test<br/>test</p>[/test_shortcode]")
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'inner_content' ).get('value') ).toEqual( "test\n\ntest\ntest" );
	} );

	it( 'parses shortcode with unquoted attributes', function() {
		var shortcode = MceViewConstructor.parseShortcodeString( '[test-shortcode test-attr=test]')
		expect( shortcode instanceof Shortcode ).toEqual( true );
		expect( shortcode.get( 'attrs' ).findWhere( { attr: 'test-attr' }).get('value') ).toEqual( 'test' );
	});

} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../../../js/src/models/shortcode.js":10,"./../../../js/src/utils/shortcode-view-constructor.js":12,"./../../../js/src/utils/sui.js":13}],5:[function(require,module,exports){
var Shortcodes = require('./../../../js/src/collections/shortcodes.js');
var sui = require('./../../../js/src/utils/sui.js');

describe( "SUI Util", function() {

	it( 'sets global variable', function() {
		expect( window.Shortcode_UI ).toEqual( sui );
	});

	it( 'expected properties', function() {
		expect( sui.shortcodes instanceof Shortcodes ).toEqual( true );
		expect( sui.views ).toEqual( {} );
	});

} );

},{"./../../../js/src/collections/shortcodes.js":7,"./../../../js/src/utils/sui.js":13}],6:[function(require,module,exports){
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
	},

});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode-attribute.js":9}],7:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var Shortcode = require('./../models/shortcode.js');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":10}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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

	},
});

module.exports = Shortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcode-attributes.js":6,"./inner-content.js":8}],11:[function(require,module,exports){
var getEditView = function ( id ) {

	var views = {
		'default':       require('./../views/edit-shortcode-form.js'),
		'shortcake_dev': require('./../views/edit-shortcode-form-test.js'),
	}

	return ( id in views ) ? views[ id ] : views['default'];

}

module.exports = getEditView;

},{"./../views/edit-shortcode-form-test.js":17,"./../views/edit-shortcode-form.js":18}],12:[function(require,module,exports){
(function (global){
var sui = require('./sui.js'),
    wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
    $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null),
    getEditView = require('./get-edit-view.js');
    // send_to_editor = require( 'sui-utils/sendtoeditor');

/**
 * Generic shortcode mce view constructor.
 * This is cloned and used by each shortcode when registering a view.
 */
var shortcodeViewConstructor = {

	initialize: function( options ) {
		this.shortcodeModel = this.getShortcodeModel( this.shortcode );
		this.renderPreview();
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
	renderPreview : function() {

		var view;

		var shortcode = this.shortcodeModel;
		view = getEditView( shortcode.get('shortcode_tag') );
		view = new view( { model: shortcode } );

		this.content = view.render().$el;
		this.render( null, true );

		shortcode.on('change', function() {
			console.log( shortcode.formatShortcode() );
		} );

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

};

module.exports = shortcodeViewConstructor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./get-edit-view.js":11,"./sui.js":13}],13:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes,
	views: {},
	controllers: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":7}],14:[function(require,module,exports){
var sui = require('./../utils/sui.js');

var editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

	events: {
		'click .add'       : '_openMediaFrame',
		'click .remove'    : '_removeAttachment',
		'selectAttachment' : '_selectAttachment',
	},

	/**
	 * Update the field attachment.
	 * Re-renders UI.
	 * If ID is empty - does nothing.
	 *
	 * @param {int} id Attachment ID
	 */
	updateValue: function( id ) {

		if ( ! id ) {
			return;
		}

		this.setValue( id );

		var self = this;

		if ( editAttributeFieldAttachment.getFromCache( id ) ) {
			self._renderPreview( editAttributeFieldAttachment.getFromCache( id ) );
			return;

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
		}

		this.$container.addClass( 'loading' );

		wp.ajax.post( 'get-attachment', {
			'id': id
		} ).done( function( attachment ) {
			// Cache for later.
			editAttributeFieldAttachment.setInCache( id, attachment );
			self._renderPreview( attachment );
			self.$container.removeClass( 'loading' );

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
		} );
	},

	render: function() {

		// Set model default values.
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! this.model.get( arg ) ) {
				this.model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( this.model.toJSON() ) );

		this.$container   = this.$el.find( '.shortcake-attachment-preview' );
		var $addButton    = this.$container.find( 'button.add' );

		this.frame = wp.media( {
			multiple: false,
			title: this.model.get( 'frameTitle' ),
			library: {
				type: this.model.get( 'libraryType' ),
			},
		} );

		// Add initial Attachment if available.
		this.updateValue( this.model.get( 'value' ) );

	},

	/**
	 * Renders attachment preview in field.
	 * @param {object} attachment model
	 * @return null
	 */
	_renderPreview: function( attachment ) {

		var $thumbnail = jQuery('<div class="thumbnail"></div>');

		if ( 'image' !== attachment.type ) {

			jQuery( '<img/>', {
				src: attachment.icon,
				alt: attachment.title,
			} ).appendTo( $thumbnail );

			jQuery( '<div/>', {
				class: 'filename',
				html:  '<div>' + attachment.title + '</div>',
			} ).appendTo( $thumbnail );

		} else {

			attachmentThumb = (typeof attachment.sizes.thumbnail !== 'undefined') ?
				attachment.sizes.thumbnail :
				_.first( _.sortBy( attachment.sizes, 'width' ) );

			jQuery( '<img/>', {
				src:    attachmentThumb.url,
				width:  attachmentThumb.width,
				height: attachmentThumb.height,
				alt:    attachment.alt,
			} ) .appendTo( $thumbnail )

		}

		$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );
		this.$container.append( $thumbnail );
		this.$container.toggleClass( 'has-attachment', true );

	},

	/**
	 * Open media frame when add button is clicked.
	 *
	 */
	_openMediaFrame: function(e) {
		e.preventDefault();
		this.frame.open();

		var self = this;
		this.frame.on( 'select', function() {
			self.$el.trigger( 'selectAttachment'  );
		} );

	},

	/**
	 * When an attachment is selected from the media frame, update the model value.
	 *
	 */
	_selectAttachment: function(e) {
		var selection  = this.frame.state().get('selection');
			attachment = selection.first();

		this.updateValue( attachment.id );
		this.frame.close();
	},

	/**
	 * Remove the attachment.
	 * Render preview & Update the model.
	 */
	_removeAttachment: function(e) {
		e.preventDefault();

		this.model.set( 'value', null );

		this.$container.toggleClass( 'has-attachment', false );
		this.$container.find( '.thumbnail' ).remove();
	},

}, {

	_idCache: {},

	/**
	 * Store attachments in a cache for quicker loading.
	 */
	setInCache: function( id, attachment ) {
		this._idCache[ id ] = attachment;
	},

	/**
	 * Retrieve an attachment from the cache.
	 */
	getFromCache: function( id ){
		if ( 'undefined' === typeof this._idCache[ id ] ) {
			return false;
		}
		return this._idCache[ id ];
	},

});

module.exports = sui.views.editAttributeFieldAttachment = editAttributeFieldAttachment;


},{"./../utils/sui.js":13}],15:[function(require,module,exports){
( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var postSelectCache = {};

	sui.views.editAttributeFieldPostSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-post-select': 'inputChanged',
		},

		inputChanged: function(e) {
			this.setValue( e.val );
			this.triggerCallbacks();
		},

		render: function() {

			var self = this,
			    defaults = { multiple: false };

			for ( var arg in defaults ) {
				if ( ! this.model.get( arg ) ) {
					this.model.set( arg, defaults[ arg ] );
				}
			}

			var data = this.model.toJSON();
			data.id = 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid;

			this.$el.html( this.template( data ) );

			var ajaxData = {
				action    : 'shortcode_ui_post_field',
				nonce     : shortcodeUiPostFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			var $field = this.$el.find( '.shortcode-ui-post-select' );

			$field.select2({

				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					quietMillis: 250,
					data: function (term, page) {
						ajaxData.s    = term;
						ajaxData.page = page;
						return ajaxData;
					},
					results: function ( response, page ) {

						if ( ! response.success ) {
							return { results: {}, more: false };
						}

						// Cache data for quicker rendering later.
						postSelectCache = $.extend( postSelectCache, response.data.posts );

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

					var ids, parsedData = [], cached;

					// Convert stored value to array of IDs (int).
					ids = $(element)
						.val()
						.split(',')
						.map( function (str) { return str.trim(); } )
						.map( function (str) { return parseInt( str ); } )

					if ( ids.length < 1 ) {
						return;
					}

					// Check if there is already cached data.
					for ( var i = 0; i < ids.length; i++ ) {
						if ( cached = _.find( postSelectCache, _.matches( { id: ids[i] } ) ) ) {
							parsedData.push( cached );
						}
					};

					// If not multiple - return single value if we have one.
					if ( parsedData.length && ! self.model.get( 'multiple' ) ) {
						callback( parsedData[0] );
						return;
					}

					var uncachedIds = _.difference( ids, _.pluck( parsedData, 'id' ) );

					if ( ! uncachedIds.length ) {

						callback( parsedData );

					} else {

						var initAjaxData      = jQuery.extend( true, {}, ajaxData );
						initAjaxData.action   = 'shortcode_ui_post_field';
						initAjaxData.post__in = uncachedIds;

						$.get( ajaxurl, initAjaxData ).done( function( response ) {

							if ( ! response.success ) {
								return { results: {}, more: false };
							}

							postSelectCache = $.extend( postSelectCache, response.data.posts );

							// If not multi-select, expects single object, not array of objects.
							if ( ! self.model.get( 'multiple' ) ) {
								callback( response.data.posts[0] );
								return;
							}

							// Append new data to cached data.
							// Sort by original order.
							parsedData = parsedData
								.concat( response.data.posts )
								.sort(function (a, b) {
									if ( ids.indexOf( a.id ) > ids.indexOf( b.id ) ) return 1;
									if ( ids.indexOf( a.id ) < ids.indexOf( b.id ) ) return -1;
									return 0;
								});

							callback( parsedData );
							return;

						} );

					}

				},

			} );

			// Make multiple values sortable.
			if ( this.model.get( 'multiple' ) ) {
				$field.select2('container').find('ul.select2-choices').sortable({
	    			containment: 'parent',
	    			start: function() { $('.shortcode-ui-post-select').select2('onSortStart'); },
	    			update: function() { $('.shortcode-ui-post-select').select2('onSortEnd'); }
				});
			}

			return this;

		}

	} );

	/**
	 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
	 * changes in Meida modal
	 * 1. going back/forth between different shortcakes (refresh)
	 * 2. changing the menu in left column (deactivate)
	 * 3. @TODO closing the modal.
	 */
	var mediaController = sui.controllers.MediaController;
	sui.controllers.MediaController = mediaController.extend({

		refresh: function(){
			mediaController.prototype.refresh.apply( this, arguments );
			this.destroySelect2UI();
		},

		//doesn't need to call parent as it already an "abstract" method in parent to provide callback
		deactivate: function() {
			this.destroySelect2UI();
		},

		destroySelect2UI: function() {
			$('.shortcode-ui-post-select.select2-container').select2( "close" );
		}

	});

	/**
	 * Extending the SUI Tabbed View to hide Select2 UI dropdown when previewing the shortcake
	 */
	var tabbedView = sui.views.TabbedView;
	sui.views.TabbedView = tabbedView.extend({
		tabSwitcher: function() {
			tabbedView.prototype.tabSwitcher.apply( this, arguments );
			$('.shortcode-ui-post-select.select2-container').select2( "close" );
		}
	});

} )( jQuery );

},{}],16:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	sui          = require('./../utils/sui.js'),
	$            = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

var editAttributeField = Backbone.View.extend( {

	tagName: "div",

	events: {
		'keyup  input[type="text"]':   'inputChanged',
		'keyup  textarea':             'inputChanged',
		'change select':               'inputChanged',
		'change input[type=checkbox]': 'inputChanged',
		'change input[type=radio]':    'inputChanged',
		'change input[type=email]':    'inputChanged',
		'change input[type=number]':   'inputChanged',
		'change input[type=date]':     'inputChanged',
		'change input[type=url]':      'inputChanged',
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
		this.triggerCallbacks();

		return this
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model. If a callback function is registered
	 * for this attribute, it should be called as well.
	 */
	inputChanged: function( e ) {

		if ( this.model.get( 'attr' ) ) {
			var $el = this.$el.find( '[name="' + this.model.get( 'attr' ) + '"]' );
		} else {
			var $el = this.$el.find( '[name="inner_content"]' );
		}

		if ( 'radio' === this.model.attributes.type ) {
			this.setValue( $el.filter(':checked').first().val() );
		} else if ( 'checkbox' === this.model.attributes.type ) {
			this.setValue( $el.is( ':checked' ) );
		} else {
			this.setValue( $el.val() );
		}

		this.triggerCallbacks();
	},

	getValue: function() {
		return this.model.get( 'value' );
	},

	setValue: function( val ) {
		this.model.set( 'value', val );
	},

	triggerCallbacks: function() {

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

}, {

	/**
	 * Get an attribute field from a shortcode by name.
	 *
	 * Usage: `sui.views.editAttributeField.getField( collection, 'title')`
	 *
	 * @param array collection of editAttributeFields
	 * @param string attribute name
	 * @return editAttributeField The view corresponding to the matching field
	 */
	getField: function( collection, attr ) {
		return _.find( collection,
			function( viewModel ) {
				return attr === viewModel.model.get('attr');
			}
		);
	}
});

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":13}],17:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
	sui = require('./../utils/sui.js'),
	backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	EditAttributeField = require('./edit-attribute-field.js'),
	EditShortcodeForm = require('./edit-shortcode-form.js'),
	$ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

/**
 * Single edit shortcode content view.
 */
var EditShortcodeFormTest = EditShortcodeForm.extend({

	template: wp.template( 'shortcode-ui-test-inline-edit' ),

	events: {
		'keyup  input[type="text"]':   'inputChanged',
		'keyup  textarea':             'inputChanged',
		'keyup  [contenteditable]':    'inputChanged',
		'change select':               'inputChanged',
		'change input[type=checkbox]': 'inputChanged',
		'change input[type=radio]':    'inputChanged',
		'change input[type=email]':    'inputChanged',
		'change input[type=number]':   'inputChanged',
		'change input[type=date]':     'inputChanged',
		'change input[type=url]':      'inputChanged',
	},

	initialize: function() {},

	render: function() {
		console.log( this.model.toJSON() );

		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	inputChanged: _.debounce( function(e) {

		var val, attr, targetAttr;

		attr = e.target.getAttribute( 'name' );

        if ( e.target.hasAttribute( 'contenteditable' ) ) {
        	val = $(e.target).html();
        } else {
        	val = e.target.value;
        }

        if ( 'content' === attr ) {
        	targetAttr = this.model.get( 'inner_content' );
        } else {
        	targetAttr = this.model.get( 'attrs' ).findWhere( { attr: attr } );
	    }

	    if ( targetAttr ) {
	      	targetAttr.set( 'value', val );
	      	this.model.trigger('change');
	      	this.model.trigger('changed');
        }


	}, 250 ),

});

module.exports = EditShortcodeFormTest;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":13,"./edit-attribute-field.js":16,"./edit-shortcode-form.js":18}],18:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
	sui = require('./../utils/sui.js'),
	backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	editAttributeField = require('./edit-attribute-field.js'),

	// Additional attribute field types: these fields are all standalone in functionality,
	// but bundled here for simplicity to save an HTTP request.
	editAttributeFieldAttachment = require('./edit-attribute-field-attachment.js'),
	editAttributeFieldPostSelect = require('./edit-attribute-field-post-select.js');


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
},{"./../utils/sui.js":13,"./edit-attribute-field-attachment.js":14,"./edit-attribute-field-post-select.js":15,"./edit-attribute-field.js":16}]},{},[1,2,3,4,5]);
