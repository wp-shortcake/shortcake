var wp = require('wp');
sui = require('sui-utils/sui');

/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template : wp.template('shortcode-default-edit-form'),

	initialize : function(options) {

		var t = this;
		this.model.get('attrs').each(function(attr) {
			// Get the field settings from localization data.
			var type = attr.get('type');

			if (!shortcodeUIFieldData[type]) {
				return;
			}

			var viewObjName = shortcodeUIFieldData[type].view;
			var tmplName = shortcodeUIFieldData[type].template;
			
			var view        = new sui.views[viewObjName]( { model: attr } );
			view.template = wp.media.template(tmplName);
			view.shortcode = t.model;

			t.views.add('.edit-shortcode-form-fields', view);

		});

	},

});

sui.views.EditShortcodeForm = EditShortcodeForm;
module.exports = EditShortcodeForm;