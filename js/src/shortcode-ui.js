var sui        = require( 'sui-utils/sui' ),
	Shortcodes = require( 'sui-collections/shortcodes' ),
	shortcodeViewConstructor = require( 'sui-utils/shortcode-view-constructor' ),
	Frame      = require( 'sui-views/frame' ),
	wp         = require( 'wp' ),
	$          = require( 'jquery' );

$(document).ready(function(){

	// Create collection of shortcode models from data.
	sui.shortcodes.add( shortcodeUIData.shortcodes );

	// wp.media.view.MediaFrame.Post = mediaFrame;

	// Register a view for each shortcode.
	sui.shortcodes.each( function( shortcode ) {
		if ( wp.mce.views ) {
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				shortcodeViewConstructor
			);
		}
	} );

	var $button, frame;

	$button = $( '<button/>', { text: 'Add element', 'class': 'button button-shortcode-ui-insert' } );
	$button.prepend( $( '<span/>', { 'class': 'dashicons-before dashicons-layout' } ) );
	$button.insertAfter( $( '#insert-media-button' ) );

	$button.click( function(e) {

		e.preventDefault();

		if ( ! frame ) {
			frame = new Frame({
				shortcodes: sui.shortcodes,
				title     : shortcodeUIData.strings.media_frame_menu_insert_label,
			});
		}

		frame.open();

	} );


});
