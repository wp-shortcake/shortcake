var Shortcodes = require('sui-collections/shortcodes');
var sui = require('sui-utils/sui');

describe( "SUI Util", function() {

	it( 'sets global variable', function() {
		expect( window.Shortcode_UI ).toEqual( sui );
	});

	it( 'expected properties', function() {
		expect( sui.shortcodes instanceof Shortcodes ).toEqual( true );
		expect( typeof sui.views === 'object' ).toBe( true );
	});

} );
