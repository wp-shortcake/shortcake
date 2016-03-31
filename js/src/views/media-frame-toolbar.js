var wp = require('wp');

/**
 * Toolbar view that extends wp.media.view.Toolbar
 * to define cusotm refresh method
 */
var Toolbar = wp.media.view.Toolbar.extend({

	refresh : function() {

		var action = this.controller.content.mode();

		if ( action ) {
			this.get('insert').model.set( 'disabled', action !== 'shortcode-ui-content-edit' );
		}

		/**
		 * call 'refresh' directly on the parent class
		 */
		wp.media.view.Toolbar.prototype.refresh.apply(this, arguments);

	}
});

module.exports = Toolbar;
