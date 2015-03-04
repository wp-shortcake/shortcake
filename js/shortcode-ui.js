var Shortcodes = require('sui-collections/shortcodes'),
	sui = require('sui-utils/sui'),
	$ = require('jquery');

$(document).ready(function(){

	// Create collection of shortcode models from data.
	sui.shortcodes = new Shortcodes( shortcodeUIData.shortcodes );

});
