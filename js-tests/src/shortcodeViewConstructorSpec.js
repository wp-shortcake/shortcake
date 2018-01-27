var Shortcode = require('../../js/src/models/shortcode');
var ShortcodeViewConstructor = require('../../js/src/utils/shortcode-view-constructor');
var EditAttributeField = require('../../js/src/views/edit-attribute-field');
var sui = require('../../js/src/utils/sui');
var $ = require('jquery');

describe( 'Shortcode View Constructor', function(){

	it( 'Persists inner_content when parsing a shortcode without inner_content attribute defined', function(){
		var data = {
			label: 'Test Label',
			shortcode_tag: 'no_inner_content',
			attrs: [
				{
					attr:        'foo',
					label:       'Attribute',
					type:        'text',
					value:       'test value',
					placeholder: 'test placeholder',
				}
			]
		};
		sui.shortcodes.add( data );
		var shortcode = ShortcodeViewConstructor.parseShortcodeString( '[no_inner_content foo="bar"]burrito[/no_inner_content]' );
		var _shortcode = $.extend( true, {}, shortcode );
		expect( _shortcode.formatShortcode() ).toEqual( '[no_inner_content foo="bar"]burrito[/no_inner_content]' );
		ShortcodeViewConstructor.shortcode = {
			'type' : 'single',
			'tag' : 'no_inner_content',
			'attrs' : {
				'named' : {
					'foo' : 'bar',
				},
				'numeric' : [],
			},
			'content' : 'burrito'
		};
		var ShortcodeViewConstructorWithoutFetch = ShortcodeViewConstructor;
		ShortcodeViewConstructorWithoutFetch.delayedFetch = function() {
			return new $.Deferred();
		};
		ShortcodeViewConstructor.initialize();
		expect( ShortcodeViewConstructor.shortcodeModel.formatShortcode() ).toEqual( '[no_inner_content foo="bar"]burrito[/no_inner_content]' );
	});

	it( 'Persists custom attribute when parsing a shortcode without the attribute defined in UI', function() {
		var data = {
			label: 'Test Label',
			shortcode_tag: 'no_custom_attribute',
			attrs: [
				{
					attr:        'foo',
					label:       'Attribute',
					type:        'text',
				}
			]
		};
		sui.shortcodes.add( data );
		var shortcode = ShortcodeViewConstructor.parseShortcodeString( '[no_custom_attribute foo="bar" bar="banana"]' );
		var _shortcode = $.extend( true, {}, shortcode );
		expect( _shortcode.formatShortcode() ).toEqual( '[no_custom_attribute foo="bar" bar="banana" /]' );
		ShortcodeViewConstructor.shortcode = {
			'type' : 'single',
			'tag' : 'no_custom_attribute',
			'attrs' : {
				'named' : {
					'foo' : 'bar',
					'bar' : 'banana',
				},
				'numeric' : [],
			},
		};
		var ShortcodeViewConstructorWithoutFetch = ShortcodeViewConstructor;
		ShortcodeViewConstructorWithoutFetch.delayedFetch = function() {
			return new $.Deferred();
		};
		ShortcodeViewConstructor.initialize();
		expect( ShortcodeViewConstructor.shortcodeModel.formatShortcode() ).toEqual( '[no_custom_attribute foo="bar" bar="banana" /]' );
	});

	it( 'Reverses the effect of core adding wpautop to shortcode inner content', function(){
		var shortcode = {
			tag: 'pullquote',
			content: 'This quote has</p>\n<p>Multiple line breaks two</p>\n<p>Test one',
			type: 'closed',
			attrs: {
				named: {},
				numeric: [],
			}
		};
		var data = {
			label: 'Pullquote',
			shortcode_tag: 'pullquote',
			inner_content: true,
		};
		sui.shortcodes.add( data );
		var model = ShortcodeViewConstructor.getShortcodeModel( shortcode );
		expect( model.get('inner_content').get('value') ).toEqual( 'This quote has\n\nMultiple line breaks two\n\nTest one' );
	});

	it( 'Reverses the effect of core adding wpautop to shortcode attribute', function(){
		var shortcode = {
			tag: 'pullquote_attr',
			attrs: {
				named: {
					quote: 'This quote has</p>\n<p>Multiple line breaks two</p>\n<p>Test one',
				},
			},
			type: 'single',
			content: null,
		};
		var data = {
			label: 'Pullquote',
			shortcode_tag: 'pullquote_attr',
			attrs: [
				{
					attr: 'quote',
					label: 'Quote',
					type: 'text',
				}
			],
		};
		sui.shortcodes.add( data );
		var model = ShortcodeViewConstructor.getShortcodeModel( shortcode );
		expect( model.get('attrs').first().get('value') ).toEqual( 'This quote has\n\nMultiple line breaks two\n\nTest one' );
	});

	it( 'Can parse shortcode content idempotently', function() {
		sui.shortcodes.add({
			label: 'Test Label',
			shortcode_tag: 'no_custom_content',
			attrs: [
				{
					attr:        'foo',
					label:       'Attribute',
					type:        'text',
					value:       'test value',
					placeholder: 'test placeholder',
				}
			]
		});
    var shortcodeString = '[no_custom_content foo="bar"]';
		var firstCall = ShortcodeViewConstructor.parseShortcodeString( shortcodeString );
		var secondCall = ShortcodeViewConstructor.parseShortcodeString( shortcodeString );
		expect( secondCall ).toBeDefined();
	});


	it( 'Select field can maintain order of options.', function() {

		var shortcode = new Shortcode({
			label: 'Test',
			shortcode_tag: 'test',
			attrs: [
				// Legacy option format
				{
					attr:        'foo',
					label:       'Foo',
					type:        'select',
					options:     { x: '1', z: '2', y: '3' },
				},
				// New array of object format
				{
					attr:        'foo',
					label:       'Foo',
					type:        'select',
					options:     [
						{ value: 'x', label: '1' },
						{ value: 'z', label: '2' },
						{ value: 'y', label: '3' },
					]
				}
			]
		});

		var view = new EditAttributeField( { model: shortcode } );
		var opt1 = view.parseOptions( shortcode.get('attrs').at(0).get('options') );
		var opt2 = view.parseOptions( shortcode.get('attrs').at(1).get('options') );

		expect( Array.isArray( opt1 ) ).toBe( true );
		expect( Array.isArray( opt2 ) ).toBe( true );
		expect( opt1[1].value ).toEqual( 'z' );
		expect( opt1[1].label ).toEqual( '2' );
		expect( opt2[1].value ).toEqual( 'z' );
		expect( opt2[1].label ).toEqual( '2' );

	});

	it( 'Can correctly decode encoded attribute values.', function() {
		sui.shortcodes.add({
			label: 'Shortcode with Encoded attribute values',
			shortcode_tag: 'encoded_attrs',
			attrs: [
				{
					attr:    'foo',
					type:    'text',
					encode:  true,
				}
			]
		});
		var shortcode = {
			'type':  'single',
			'tag':   'encoded_attrs',
			'attrs': {
				'named': {
					'foo': 'This%20100%26%2337%3B%20encoded%20attr%20has%20a%20percent%20%22%26%2337%3B%22%20character%20in%20it.',
				},
			},
		};

		var model = ShortcodeViewConstructor.getShortcodeModel( shortcode );
		expect( model.get('attrs').first().get('value') )
			.toEqual( 'This 100% encoded attr has a percent "%" character in it.' );
	});
});
