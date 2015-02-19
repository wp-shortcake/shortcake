var wp = require('wp');
var InsertShortcodeListItem = require('sui-views/insert-shortcode-list-item');

var InsertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function(options) {

		var t = this;

		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new InsertShortcodeListItem({
				model : shortcode
			}));
		});

	},

});

module.exports = InsertShortcodeList;