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
