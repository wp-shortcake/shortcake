var Shortcode = require('../../js/src/models/shortcode');
var ShortcodeViewConstructor = require('../../js/src/utils/shortcode-view-constructor');
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
	});

});
