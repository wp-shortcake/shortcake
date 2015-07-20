var getEditView = function ( id ) {

	var views = {
		'default':       require('sui-views/edit-shortcode-form'),
		'shortcake_dev': require( 'sui-views/edit-shortcode-form-test' ),
	}

	return ( id in views ) ? views[ id ] : views['default'];

}

module.exports = getEditView;
