var wp = require('wp'),
sui = require('sui-utils/sui'),
editAttributeField = require( 'sui-views/edit-attribute-field' );

/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template: wp.template('shortcode-default-edit-form'),

	initialize: function() {

		var t = this;

		if ( this.model.get( 'inner_content' ) ) {

			// add UI for inner_content
			var view = new editAttributeField( {
				model:     this.model.get( 'inner_content' ),
				shortcode: t.model,
			} );

			view.template = wp.media.template( 'shortcode-ui-content' );
			t.views.add( '.edit-shortcode-form-fields', view );

		}

		this.model.get( 'attrs' ).each( function( attr ) {

			// Get the field settings from localization data.
			var type = attr.get('type');

			if ( ! shortcodeUIFieldData[ type ] ) {
				return;
			}

			var viewObjName = shortcodeUIFieldData[ type ].view;
			var tmplName    = shortcodeUIFieldData[ type ].template;

			var view        = new sui.views[viewObjName]( { model: attr } );
			view.template   = wp.media.template( tmplName );
			view.shortcode = t.model;

			t.views.add( '.edit-shortcode-form-fields', view );

		} );

	},

});

module.exports = EditShortcodeForm;
