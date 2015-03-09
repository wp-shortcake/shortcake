var Shortcode = require('sui-models/shortcode');
var MceViewConstructor = require('sui-utils/shortcode-view-constructor');
var sui = require('sui-utils/sui');
var $ = require('jquery');

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

		var constructor = $.extend( true, {}, MceViewConstructor );

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

	it ( 'test getContent.', function() {

		var constructor = $.extend( true, {}, MceViewConstructor );

		spyOn( constructor, 'fetch' );

		constructor.content = '<h1>test content</h1>';
		expect( constructor.getContent() ).toEqual( '<h1>test content</h1>' );
		expect( constructor.fetch ).not.toHaveBeenCalled();

	    constructor.content = null;
	    expect( constructor.getContent() ).toEqual( null );
        expect( constructor.fetch ).toHaveBeenCalled();

	} );

	it( 'parses shortcode strings correctly', function() {

		// Test standard.
		var shortcode1 = MceViewConstructor.parseShortcodeString( '[test_shortcode attr="test value"]')
		expect( shortcode1 instanceof Shortcode ).toEqual( true );
		expect( shortcode1.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test value' );

		// Test with content.
		var shortcode1 = MceViewConstructor.parseShortcodeString( '[test_shortcode attr="test value 1"]test content [/test_shortcode]')
		expect( shortcode1 instanceof Shortcode ).toEqual( true );
		expect( shortcode1.get( 'attrs' ).findWhere( { attr: 'attr' }).get('value') ).toEqual( 'test value 1' );
		expect( shortcode1.get( 'inner_content' ).get('value') ).toEqual( 'test content ' );

		// Test dashes in shortcode and attribute names.
		var shortcode2 = MceViewConstructor.parseShortcodeString( '[test-shortcode test-attr="test value 2"]')
		expect( shortcode2 instanceof Shortcode ).toEqual( true );
		expect( shortcode2.get( 'attrs' ).findWhere( { attr: 'test-attr' }).get('value') ).toEqual( 'test value 2' );

		// Test content with line breaks.
		var shortcode3 = MceViewConstructor.parseShortcodeString( "[test_shortcode]test \ncontent \r2 [/test_shortcode]")
		expect( shortcode1 instanceof Shortcode ).toEqual( true );
		expect( shortcode1.get( 'inner_content' ).get('value') ).toEqual( "test \ncontent \r2 " );

	} );

} );
