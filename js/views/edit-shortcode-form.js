var wp = require('wp');

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
			
			//@todo: figure out a way to load the view dynamically. 
			var tmplView = require('./' + viewObjName);

			var view = new tmplView({
				model : attr
			});
			view.template = wp.media.template(tmplName);
			view.shortcode = t.model;

			t.views.add('.edit-shortcode-form-fields', view);

		});

	},

});

module.exports = EditShortcodeForm;