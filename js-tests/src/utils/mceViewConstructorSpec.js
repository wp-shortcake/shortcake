var Shortcode = require('sui-models/shortcode');
var MceViewConstructor = require('sui-utils/shortcode-view-constructor');
var sui = require('sui-utils/sui');
var $ = require('jquery');
var wp = require('wp');

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

		// If content is set - just return and don't fetch data.
		constructor.content = '<h1>test content</h1>';
		expect( constructor.getContent() ).toEqual( '<h1>test content</h1>' );
		expect( constructor.fetch ).not.toHaveBeenCalled();

		// If content is empty - just null and fetch should be called.
		constructor.content = null;
		expect( constructor.getContent() ).toEqual( null );
		expect( constructor.fetch ).toHaveBeenCalled();

	} );

	describe( "Fetch preview HTML", function() {

		beforeEach(function() {
			jasmine.Ajax.install();
		});

		afterEach(function() {
			jasmine.Ajax.uninstall();
		});

		var constructor = $.extend( true, {
			render: function( force ) {},
		}, MceViewConstructor );

		// Mock shortcode model data.
		constructor.shortcodeModel = $.extend( true, {}, sui.shortcodes.first() );

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
