var wp = require('wp'),
	$ = require('jquery');

/**
 * Single shortcode list item view.
 */
var insertShortcodeListItem = wp.Backbone.View.extend({

	tagName : 'li',
	template : wp.template('add-shortcode-list-item'),
	className : 'shortcode-list-item',

	render : function() {

		var data = this.model.toJSON();
		this.$el.attr('data-shortcode', data.shortcode_tag);

		if (('listItemImage' in data) && 0 === data.listItemImage.indexOf('dashicons-')) {
			var fakeEl = $('<div />').addClass( 'dashicons' ).addClass( data.listItemImage );
			data.listItemImage = $('<div />').append( fakeEl ).html();
		}

		this.$el.html(this.template(data));

		return this;

	}
});

module.exports = insertShortcodeListItem;
