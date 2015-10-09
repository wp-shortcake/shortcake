var Backbone = require('backbone'),
    $ = require('jquery');

/**
 * Preview of rendered shortcode.
 * Asynchronously fetches rendered shortcode content from WordPress.
 * Displayed in an iframe to isolate editor styles.
 *
 * @class ShortcodePreview
 * @constructor
 * @params options
 * @params options.model {Shortcode} Requires a valid shortcode.
 */
var ShortcodePreview = Backbone.View.extend({
	initialize: function( options ) {
		this.head = this.getEditorStyles().join( "\n" );
	},

	getLoading: function() {
		return '<div class="loading-placeholder">' +
			'<div class="dashicons dashicons-admin-media"></div>' +
			'<div class="wpview-loading"><ins></ins></div>' +
		'</div>';
	},

	/**
	 * @method render
	 * @chainable
	 * @returns {ShortcodePreview}
	 */
	render: function() {

		var self = this;

		// Render loading iFrame.
		this.renderIFrame({
			head: self.head,
			body: self.getLoading(),
		});

		// Fetch shortcode preview.
		// Render iFrame with shortcode preview.
		this.fetchShortcode( function( response ) {
			self.renderIFrame({
				head: self.head,
				body: response,
			});
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

		var self = this, $iframe, resize;

		_.defaults( params || {}, { 'head': '', 'body': '', 'body_classes': 'shortcake shortcake-preview' });

		var isIE = typeof tinymce != 'undefined' ? tinymce.Env.ie : false;

		$iframe = $( '<iframe/>', {
			src: isIE ? 'javascript:""' : '', // jshint ignore:line
			frameBorder: '0',
			allowTransparency: 'true',
			scrolling: 'no',
			style: "width: 100%; display: block",
		} );

		/**
		 * Render preview in iFrame once loaded.
		 * This is required because you can't write to
		 * an iFrame contents before it exists.
		 */
		$iframe.load( function() {

			self.autoresizeIframe( $(this) );

			var head = $(this).contents().find('head'),
			    body = $(this).contents().find('body');

			head.html( params.head );
			body.html( params.body );
			body.addClass( params.body_classes );

		} );

		this.$el.html( $iframe );

	},

	/**
	 * Watch for mutations in iFrame content.
	 * resize iFrame height on change.
	 *
	 * @param  $ object $iframe
	 */
	autoresizeIframe: function( $iframe ) {

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

		// Resize iFrame to size inner document.
		var resize = function() {
			$iframe.height( $iframe.contents().find('html').height() );
		};

		resize();

		if ( MutationObserver ) {

			var observer = new MutationObserver( function() {
				resize();
				$iframe.contents().find('img,link').load( resize );
			} );

			observer.observe(
				$iframe.contents()[0],
				{ attributes: true, childList: true, subtree: true }
			);

		} else {

			for ( i = 1; i < 6; i++ ) {
				setTimeout( resize, i * 700 );
			}

		}

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

		wp.ajax.post( 'do_shortcode', {
			post_id: $( '#post_ID' ).val(),
			shortcode: this.model.formatShortcode(),
			nonce: shortcodeUIData.nonces.preview,
		}).done( function( response ) {
			callback( response );
		}).fail( function() {
			var span = $('<span />').addClass('shortcake-error').text( shortcodeUIData.strings.mce_view_error );
			var wrapper = $('<div />').html( span );
			callback( wrapper.html() );
		} );

	},

	/**
	 * Returns an array of <link> tags for stylesheets applied to the TinyMCE editor.
	 *
	 * @method getEditorStyles
	 * @returns {Array}
	 */
	getEditorStyles: function() {
		var styles = {};

		var editors = typeof tinymce != 'undefined' ? tinymce.editors : [];
		_.each( editors, function( editor ) {
			_.each( editor.dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
				if ( link.href ) {
					styles[ link.href ] = true;
				}
			});
		});

		styles = _.map( _.keys( styles ), function( href ) {
			return $( '<link rel="stylesheet" type="text/css">' ).attr( 'href', href )[0].outerHTML;
		});

		return styles;
	}
});

module.exports = ShortcodePreview;
