var sui = require('sui-utils/sui'),
	Shortcodes = require('sui-collections/shortcodes'),
	shortcodeViewConstructor = require('sui-utils/shortcode-view-constructor'),
	mediaFrame = require('sui-views/media-frame'),
	ShortcodeUI = require('sui-views/shortcode-ui'),
	wp = require('wp'),
	$ = require('jquery');

$(document).ready(function(){

	// Create collection of shortcode models from data.
	sui.shortcodes.add( shortcodeUIData.shortcodes );

	wp.media.view.MediaFrame.Post = mediaFrame;

	// Register a view for each shortcode.
	sui.shortcodes.each( function( shortcode ) {
		if ( wp.mce.views ) {
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				shortcodeViewConstructor
			);
		}
	} );

	// Testing.
	// var $container = $( '<div/>', { style: 'clear: both; overflow: hidden;' } ).prependTo( $('#wpbody-content') );
	// var ui = new ShortcodeUI({ shortcodes: sui.shortcodes });
	// $container.append( ui.render().$el );

	// var $button = $('<button>', { text: 'click', 'class': 'button button-primary btn btn-primary', 'style': 'clear: both;' } );
	// $button.insertAfter( $container );

	// $button.click( function() {

	// 	if ( ui.shortcode ) {
	// 		alert( ui.shortcode.formatShortcode() );
	// 	}

	// });

});
