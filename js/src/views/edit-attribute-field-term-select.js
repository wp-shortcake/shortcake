var Backbone     = require('backbone'),
	sui          = require('sui-utils/sui'),
	select2Field = require('sui-views/select2-field.js'),
	$            = require('jquery');

sui.views.editAttributeFieldTermSelect = sui.views.editAttributeSelect2Field.extend( {

	selector: '.shortcode-ui-term-select',

	ajaxData: {
		action    : 'shortcode_ui_term_field',
		nonce     : shortcodeUiTermFieldData.nonce,
	},

	events: {
		'change .shortcode-ui-term-select': 'inputChanged',
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
