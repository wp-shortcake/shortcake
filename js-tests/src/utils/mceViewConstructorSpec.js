var Shortcode = require('sui-models/shortcode');
var MceViewConstructor = require('sui-utils/shortcode-view-constructor');
var sui = require('sui-utils/sui');
var jQuery = require('jquery');
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
