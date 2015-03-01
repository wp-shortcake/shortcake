var wp = require('wp');
sui = require('sui-utils/sui');

/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template: wp.template('shortcode-default-edit-form'),

	initialize: function() {

		var t = this;

		// add UI for inner_content
		var model = this.model.get( 'inner_content' );
		if ( typeof model.attributes.type !== 'undefined' ) {
			var viewObjName = 'editAttributeField';
			var tmplName    = 'shortcode-ui-content';

			var view        = new sui.views[viewObjName]( { model: this.model.get( 'inner_content' ) } );
			view.template   = wp.media.template( tmplName );
			view.shortcode = t.model;

			t.views.add( '.edit-shortcode-form-fields', view );
		}
		
		this.model.get( 'attrs' ).each( function( attr ) {

			// Get the field settings from localization data.
			var type = attr.get('type');
			
			if ( ! shortcodeUIFieldData[ type ] ) {
				return;
			}
			
			// Support for custom attributes for the field input
			_.each( _.difference( _.keys( attr.attributes ), _.keys( attr.defaults ) ), function(key, e) {
				if ( _.isEmpty( attr.get( key ) ) ) {
					attr.set( 'custom', attr.get( 'custom' ) + ' ' + key );
				} else {
					attr.set( 'custom', attr.get( 'custom' ) + ' ' + key + '="' + _.escape( attr.get( key ) ) + '"' );
				}
			});

			var viewObjName = shortcodeUIFieldData[ type ].view;
			var tmplName    = shortcodeUIFieldData[ type ].template;

			var view        = new sui.views[viewObjName]( { model: attr } );
			view.template   = wp.media.template( tmplName );
			view.shortcode = t.model;

			t.views.add( '.edit-shortcode-form-fields', view );

		} );
		
	},

});

sui.views.EditShortcodeForm = EditShortcodeForm;
module.exports = EditShortcodeForm;
