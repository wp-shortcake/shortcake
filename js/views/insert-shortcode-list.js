var wp = require('wp');

var InsertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function(options) {

		var t = this;

		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new sui.views.insertShortcodeListItem({
				model : shortcode
			}));
		});

	},

});