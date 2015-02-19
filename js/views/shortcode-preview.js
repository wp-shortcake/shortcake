var Backbonen = require('backbone'),
	Dom = require('sui-utils/dom')


var ShortcodePreview = Backbone.View.extend({
	initialize: function( options ) {
		this.stylesheets = this.getEditorStyles().join( "\n" );

		this.iframe = false;
	},

	/**
	 * @method render
	 * @chainable
	 * @returns {ShortcodePreview}
	 */
	render: function() {
		var self = this;
		var stylesheets = this.stylesheets;

		self.renderIFrame({ body: wp.mce.View.prototype.loadingPlaceholder(), head: stylesheets });

		this.fetchShortcode( function( result ) {
			self.renderIFrame({ body: result, head: stylesheets });
		});

		return this;
	},

	/**
	 * Render a child iframe, removing any previously rendered iframe. Additionally, observe the rendered iframe
	 * for mutations and resize as necessary to match content.
	 *
	 * @param params
	 */
	renderIFrame: function( params ) {
		var iframe = false;

		_.defaults( params, { 'body_classes': "shortcake shortcake-preview" });

		if ( iframe = this.iframe ) {
			$( iframe ).remove();
		}

		iframe = this.iframe = Dom.IFrame.create( this.$el, params );

		Dom.IFrame.observe( iframe, _.debounce( function() {
			var doc;

			if ( doc = ( iframe.contentWindow && iframe.contentWindow.document ) ) {
				$( iframe ).height( $( doc.body ).height() );
			}
		}, 100 ) );
	},

	/**
	 * Makes an AJAX call to the server to render the shortcode based on user supplied attributes. Server-side
	 * rendering is necessary to allow for shortcodes that incorporate external content based on shortcode
	 * attributes.
	 *
	 * @method fetchShortcode
	 * @returns {String} Rendered shortcode markup (HTML).
	 */
	fetchShortcode: function( callback ) {
		var self = this;
		var data;
		var shortcode = this.model;

		// Fetch shortcode markup using template tokens.
		data = {
			action: 'do_shortcode',
			post_id: $('#post_ID').val(),
			shortcode: shortcode.formatShortcode(),
			nonce: shortcodeUIData.nonces.preview
		};

		$.post( ajaxurl, data, callback );
	},

	/**
	 * Returns an array of <link> tags for stylesheets applied to the TinyMCE editor.
	 *
	 * @method getEditorStyles
	 * @returns {Array}
	 */
	getEditorStyles: function() {
		var styles = {};

		_.each( tinymce.editors, function( editor ) {
			_.each( editor.dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
				var href;
				( href = link.href ) && ( styles[href] = true );	// Poor man's de-duping.
			});
		});

		styles = _.map( _.keys( styles ), function( href ) {
			return $( '<link rel="stylesheet" type="text/css">' ).attr( 'href', href )[0].outerHTML;
		});

		return styles;
	}
});

module.exports = ShortcodePreview;
