var wp = require('wp');
var insertShortcodeListItem = require('sui-views/insert-shortcode-list-item');
var Shortcodes = require('sui-collections/shortcodes');
sui = require('sui-utils/sui');

var insertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function( options ) {

		this.displayShortcodes( options );

	},
	
	refresh: function( shortcodeData ) {
		var options = { shortcodes: new Shortcodes( shortcodeData ) };
		this.displayShortcodes( options );
	},
	
	displayShortcodes: function(options) {
		var t = this;
		
		t.views.unset();
		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new insertShortcodeListItem({
				model : shortcode
			}));
		});
	}

});

sui.views.InsertShortcodeList = insertShortcodeList;
module.exports = insertShortcodeList;