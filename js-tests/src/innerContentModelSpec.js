var InnerContent = require('../../js/models/inner-content');

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
