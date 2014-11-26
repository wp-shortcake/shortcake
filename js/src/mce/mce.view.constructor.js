define( ['jquery'], function ( $ ) {
	'use strict';

	// @was sui.utils.shortcodeViewConstructor
	var MCEViewConstructor = {

		View: {

			shortcodeHTML: false,

			initialize: function( options ) {

				var shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.shortcode.tag } );

				if ( ! shortcodeModel ) {
					return;
				}

				shortcode = shortcodeModel.clone();

				shortcode.get( 'attrs' ).each( function( attr ) {

					if ( attr.get( 'attr') in options.shortcode.attrs.named ) {
						attr.set(
							'value',
							options.shortcode.attrs.named[ attr.get( 'attr') ]
						);
					}

					if ( attr.get( 'attr' ) === 'content' && ( 'content' in options.shortcode ) ) {
						attr.set( 'value', options.shortcode.content );
					}

				});

				this.shortcode = shortcode;

			},

			/**
			 * @see wp.mce.View.getEditors
			 */
			getEditors: function( callback ) {
				var editors = [];

				_.each( tinymce.editors, function( editor ) {
					if ( editor.plugins.wpview ) {
						if ( callback ) {
							callback( editor );
						}

						editors.push( editor );
					}
				}, this );

				return editors;
			},

			/**
			 * @see wp.mce.View.getNodes
			 */
			getNodes: function( callback ) {
				var nodes = [],
					self = this;

				this.getEditors( function( editor ) {
					$( editor.getBody() )
						.find( '[data-wpview-text="' + self.encodedText + '"]' )
						.each( function ( i, node ) {
							if ( callback ) {
								callback( editor, node, $( node ).find( '.wpview-content' ).get( 0 ) );
							}

							nodes.push( node );
						} );
				} );

				return nodes;
			},

			/**
			 * Set the HTML. Modeled after wp.mce.View.setIframes
			 *
			 * If it includes a script tag, needs to be wrapped in an iframe
			 */
			setHtml: function( body ) {
				var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

				if ( body.indexOf( '<script' ) === -1 ) {
					this.shortcodeHTML = body;
					this.render( true );
					return;
				}

				this.getNodes( function ( editor, node, content ) {
					var dom = editor.dom,
						styles = '',
						bodyClasses = editor.getBody().className || '',
						iframe, iframeDoc, i, resize;

					content.innerHTML = '';
					head = '';

					$(node).addClass('wp-mce-view-show-toolbar');

					if ( ! wp.mce.views.sandboxStyles ) {
						tinymce.each( dom.$( 'link[rel="stylesheet"]', editor.getDoc().head ), function( link ) {
							if ( link.href && link.href.indexOf( 'skins/lightgray/content.min.css' ) === -1 &&
								link.href.indexOf( 'skins/wordpress/wp-content.css' ) === -1 ) {

								styles += dom.getOuterHTML( link ) + '\n';
							}
						});

						wp.mce.views.sandboxStyles = styles;
					} else {
						styles = wp.mce.views.sandboxStyles;
					}

					// Seems Firefox needs a bit of time to insert/set the view nodes, or the iframe will fail
					// especially when switching Text => Visual.
					setTimeout( function() {
						iframe = dom.add( content, 'iframe', {
							src: tinymce.Env.ie ? 'javascript:""' : '',
							frameBorder: '0',
							allowTransparency: 'true',
							scrolling: 'no',
							'class': 'wpview-sandbox',
							style: {
								width: '100%',
								display: 'block'
							}
						} );

						iframeDoc = iframe.contentWindow.document;

						iframeDoc.open();
						iframeDoc.write(
								'<!DOCTYPE html>' +
								'<html>' +
								'<head>' +
								'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />' +
								head +
								styles +
								'<style>' +
								'html {' +
								'background: transparent;' +
								'padding: 0;' +
								'margin: 0;' +
								'}' +
								'body#wpview-iframe-sandbox {' +
								'background: transparent;' +
								'padding: 1px 0 !important;' +
								'margin: -1px 0 0 !important;' +
								'}' +
								'body#wpview-iframe-sandbox:before,' +
								'body#wpview-iframe-sandbox:after {' +
								'display: none;' +
								'content: "";' +
								'}' +
								'</style>' +
								'</head>' +
								'<body id="wpview-iframe-sandbox" class="' + bodyClasses + '">' +
								body +
								'</body>' +
								'</html>'
						);
						iframeDoc.close();

						resize = function() {
							// Make sure the iframe still exists.
							iframe.contentWindow && $( iframe ).height( $( iframeDoc.body ).height() );
						};

						if ( MutationObserver ) {
							new MutationObserver( _.debounce( function() {
								resize();
							}, 100 ) )
								.observe( iframeDoc.body, {
									attributes: true,
									childList: true,
									subtree: true
								} );
						} else {
							for ( i = 1; i < 6; i++ ) {
								setTimeout( resize, i * 700 );
							}
						}

						editor.on( 'wp-body-class-change', function() {
							iframeDoc.body.className = editor.getBody().className;
						});
					}, 50 );
				});

			},

			/**
			 * Render the shortcode
			 *
			 * To ensure consistent rendering - this makes an ajax request to the admin and displays.
			 * @return string html
			 */
			getHtml: function() {

				var data;

				if ( false === this.shortcodeHTML ) {

					data = {
						action: 'do_shortcode',
						post_id: $('#post_ID').val(),
						shortcode: this.shortcode.formatShortcode(),
						nonce: shortcodeUIData.previewNonce
					};

					$.post( ajaxurl, data, $.proxy( this.setHtml, this ) );

				}

				return this.shortcodeHTML;

			}

		},

		/**
		 * Edit shortcode.
		 *
		 * Parses the shortcode and creates shortcode mode.
		 * @todo - I think there must be a cleaner way to get
		 * the shortcode & args here that doesn't use regex.
		 */
		edit: function( node ) {

			var shortcodeString, model, attr;

			shortcodeString = decodeURIComponent( $(node).attr( 'data-wpview-text' ) );

			var megaRegex = /\[([^\s\]]+)([^\]]+)?\]([^\[]*)?(\[\/(\S+?)\])?/;
			var matches = shortcodeString.match( megaRegex );

			if ( ! matches ) {
				return;
			}

			defaultShortcode = sui.shortcodes.findWhere( { shortcode_tag: matches[1] } );

			if ( ! defaultShortcode ) {
				return;
			}

			currentShortcode = defaultShortcode.clone();

			if ( matches[2] ) {

				attributeMatches = matches[2].match(/(\S+?=".*?")/g ) || [];

				// convert attribute strings to object.
				for ( var i = 0; i < attributeMatches.length; i++ ) {

					var bitsRegEx = /(\S+?)="(.*?)"/g;
					var bits = bitsRegEx.exec( attributeMatches[i] );

					attr = currentShortcode.get( 'attrs' ).findWhere( { attr: bits[1] } );
					if ( attr ) {
						attr.set( 'value', bits[2] );
					}

				}

			}

			if ( matches[3] ) {
				var content = currentShortcode.get( 'attrs' ).findWhere( { attr: 'content' } );
				if ( content ) {
					content.set( 'value', matches[3] );
				}
			}

			var wp_media_frame = wp.media.frames.wp_media_frame = wp.media( {
				frame: "post",
				state: 'shortcode-ui',
				currentShortcode: currentShortcode,
			} );

			wp_media_frame.open();

		}

	};

	return MCEViewConstructor;
});