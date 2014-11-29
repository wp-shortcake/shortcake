define( [], function() {
    'use strict';

	/**
	 * @was sui.models.ShortcodeAttribute
	 */
	var ShortcodeAttribute = Backbone.Model.extend({
		defaults: {
			attr:        '',
			label:       '',
			type:        '',
			value:       '',
			placeholder: ''
		}
	});

	return ShortcodeAttribute;
});