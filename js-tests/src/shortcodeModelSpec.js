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
