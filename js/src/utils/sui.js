var Shortcodes = require('sui-collections/shortcodes');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes(),
	views: {},
	controllers: {},
	utils: {},
};

module.exports = window.Shortcode_UI;
