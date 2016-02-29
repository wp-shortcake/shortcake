var Shortcodes = require( 'sui-collections/shortcodes' ),
	FrameState = require( 'sui-controllers/frame-state' );

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes(),
	views: {},
	controllers: {
		FrameState: FrameState,
	},
	utils: {},
};

module.exports = window.Shortcode_UI;
