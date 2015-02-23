var Backbone = require('backbone'),
	wp = require('wp'),
	Shortcodes = require('sui-collections/shortcodes'),
	shortcodeViewConstructor = require('sui-utils/shortcode-view-constructor');

sui = require('sui-utils/sui');

window.Shortcode_UI = sui;

jQuery(document).ready(function(){
	var shortcodes = new Shortcodes( shortcodeUIData.shortcodes )
	sui.shortcodes = shortcodes;
	
	shortcodes.each( function( shortcode ) {
		if( wp.mce.views ) {
			// Register the mce view for each shortcode.
			// Note - clone the constructor.
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				$.extend( true, {}, shortcodeViewConstructor )
			);
		}
	} );
});