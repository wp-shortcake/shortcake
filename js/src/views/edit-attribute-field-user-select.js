var Backbone     = require('backbone'),
	sui          = require('sui-utils/sui'),
	select2Field = require('sui-views/select2-field.js'),
	$            = require('jquery');

sui.views.editAttributeFieldUserSelect = sui.views.editAttributeSelect2Field.extend( {

	selector: '.shortcode-ui-user-select',

	ajaxData: {
		action    : 'shortcode_ui_user_field',
		nonce     : shortcodeUiUserFieldData.nonce,
	},

	events: {
		'change .shortcode-ui-user-select': 'inputChanged',
	},

	templateResult: function( user ) {
		if ( user.loading ) {
			return user.text;
		}

		var $markup = $('<div />')
			.addClass('clearfix select2-result-selectable')
			.text(user.text);

		return $markup;
	},

	templateSelection: function( user, container ) {
		return user.text;
	},


} );
