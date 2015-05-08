var ShortcodeAttribute = require('../../js/src/models/shortcode-attribute');

describe( "Shortcode Attribute Model", function() {

	var attrData = {
		attr:           'attr',
		label:          'Attribute',
		type:           'text',
		value:          'test value',
		description:    'test description',
		meta:  {
			placeholder: 'test placeholder'
		}
	},
	expectedAttrData = _.extend( attrData, { default_value: '' });

	var attr = new ShortcodeAttribute( attrData );

	it( 'should correctly set data.', function() {
		expect( attr.toJSON() ).toEqual( expectedAttrData );
	});

	var attrData = {
		attr:           'attr',
		label:          'Attribute',
		type:           'text',
		default_value:  'test value',
		description:    'test description',
		meta:  {
			placeholder: 'test placeholder'
		}
	},
	expectedAttrData = _.extend( attrData, { value: 'test_value' });

	var attr = new ShortcodeAttribute( attrData );

	it( 'should correctly apply default values to shortcode attributes.', function() {
		expect( attr.toJSON() ).toEqual( expectedAttrData );
	});


} );
