var Shortcodes      = require( 'sui-collections/shortcodes' ),
	FrameController = require( 'sui-controllers/frame-controller' );

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes(),
	views: {},
	controllers: {
		FrameController: FrameController,
	},
	utils: {},
};

module.exports = window.Shortcode_UI;
