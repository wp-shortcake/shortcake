var wp = require('wp');

var MediaController = wp.media.controller.State.extend({

		initialize: function(){

			this.props = new Backbone.Model({
				currentShortcode: null,
				action: 'select',
			});

			this.props.on( 'change:action', this.refresh, this );

		},

		refresh: function() {
			// @todo Need to trigger disabled state on button.
		},

		insert: function() {
			var shortcode = this.props.get('currentShortcode');
			if ( shortcode ) {
				send_to_editor( shortcode.formatShortcode() );
				this.reset();
				this.frame.close();
			}
		},

		reset: function() {
			this.props.set( 'action', 'select' );
			this.props.set( 'currentShortcode', null );
		},

	});

module.exports = MediaController;