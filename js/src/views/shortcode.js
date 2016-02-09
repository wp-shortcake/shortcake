
var preview = Backbone.View.extend({

	shortcode: null,
	post_id: null,

	templateEmpty: '<span class="shortcake-notice shortcake-empty"><%= notice %></span>',

	initialize: function( options ) {
		this.post_id   = options.post_id;
		this.shortcode = options.shortcode;
	},

	render: function() {},

	fetch: function() {

		var self = this, template;

		wp.ajax.post( 'do_shortcode', {
			post_id:   this.post_id,
			shortcode: this.shortcode.formatShortcode(),
			nonce:     shortcodeUIData.nonces.preview,
		}).done( function( response ) {
			if ( '' === response ) {
				template     = _.template( this.templateEmpty );
				self.content = template( { notice: self.shortcodeModel.formatShortcode() } );
			} else {
				self.content = response;
			}
		}).fail( function() {
			self.content = '<span class="shortcake-error">' + shortcodeUIData.strings.mce_view_error + '</span>';
		} ).always( function() {
			delete self.fetching;
			self.render( null, true );
		} );
	}

});
