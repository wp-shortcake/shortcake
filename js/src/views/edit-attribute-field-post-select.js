var Backbone     = require('backbone'),
	sui          = require('sui-utils/sui'),
	select2Field = require('sui-views/select2-field.js'),
	$            = require('jquery');

sui.views.editAttributeFieldPostSelect = sui.views.editAttributeSelect2Field.extend( {

	selector: '.shortcode-ui-post-select',

	ajaxData: {
		action    : 'shortcode_ui_post_field',
		nonce     : shortcodeUiPostFieldData.nonce,
	},

	events: {
		'change .shortcode-ui-post-select': 'inputChanged',
	},

	templateResult: function( post ) {
		if ( post.loading ) {
			return post.text;
		}

		var markup = '<div class="clearfix select2-result-selectable">' +
			post.text +
		'</div>';

		return markup;
	},

	templateSelection: function( post, container ) {
		return post.text;
	},


} );
