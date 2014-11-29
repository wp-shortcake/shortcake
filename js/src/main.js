(function( global ) {
	require( ['jquery', 'shortcodes/shortcode.collection', 'mce/mce.view.constructor'], function( $, Shortcodes, MCEViewConstructor ) {
		'use strict';

		global.sui = global.sui || {};

		$( document ).ready( function() {

			var shortcodes = sui.shortcodes = new Shortcodes( shortcodeUIData.shortcodes );

			shortcodes.each( function( shortcode ) {

				// Register the mce view for each shortcode.
				// Note - clone the constructor.
				wp.mce.views.register( shortcode.get( 'shortcode_tag' ), $.extend( true, {}, MCEViewConstructor ) );
			});

		});
	});
})( window );
