var wp = require('wp'),
	shortcodeViewConstructor = require('sui-utils/shortcode-view-constructor'),
	sui = require('sui-utils/sui');
	// Just including this file is all thats needed.
	mediaFrame = require('sui-views/media-frame');
	$ = require('jquery');

$(document).ready(function(){

	// Register a view for each shortcode.
	sui.shortcodes.each( function( shortcode ) {
		if ( wp.mce.views ) {
			// Note - clone the constructor.
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				$.extend( true, {}, shortcodeViewConstructor )
			);
		}
	} );

});
