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
