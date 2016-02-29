var sui                = require( 'sui-utils/sui' ),
	Shortcodes         = require( 'sui-collections/shortcodes' ),
	MceViewConstructor = require( 'sui-utils/shortcode-view-constructor' ),
	Frame              = require( 'sui-views/media-frame' ),
	wp                 = require( 'wp' ),
	$                  = require( 'jquery' );

$(document).ready(function(){

	var $button, frame;

	// Create collection of shortcode models from data.
	sui.shortcodes.add( shortcodeUIData.shortcodes );

	// Register an MCE view for each shortcode.
	sui.shortcodes.each( function( shortcode ) {
		if ( wp.mce.views ) {
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				MceViewConstructor
			);
		}
	} );

	// Create the add shortcode media button.
	$button = $( '<button/>', { text: 'Add element', 'class': 'button button-shortcode-ui-insert' } );
	$button.prepend( $( '<span/>', { 'class': 'dashicons-before dashicons-layout' } ) );
	$button.insertAfter( $( '#insert-media-button' ) );

	// On Click, maybe create a Shortcode UI Frame, and open it.
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
