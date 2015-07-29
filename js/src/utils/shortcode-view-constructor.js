var sui = require('sui-utils/sui'),
    wp = require('wp'),
    $ = require('jquery'),
    getEditView = require( 'sui-utils/get-edit-view');
    // send_to_editor = require( 'sui-utils/sendtoeditor');

/**
 * Generic shortcode mce view constructor.
 * This is cloned and used by each shortcode when registering a view.
 */
var shortcodeViewConstructor = {

	initialize: function( options ) {
		this.shortcodeModel = this.getShortcodeModel( this.shortcode );
		this.renderPreview();
	},

	/**
	 * Get the shortcode model given the view shortcode options.
	 * Must be a registered shortcode (see sui.shortcodes)
	 */
	getShortcodeModel: function( options ) {

		var shortcodeModel;

		shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.tag } );

		if ( ! shortcodeModel ) {
			return;
		}

		shortcodeModel = shortcodeModel.clone();

		shortcodeModel.get('attrs').each(
			function( attr ) {
				if ( attr.get('attr') in options.attrs.named ) {
					attr.set(
						'value',
						options.attrs.named[ attr.get('attr') ]
					);
				}
			}
		);

		if ( 'content' in options ) {
			var innerContent = shortcodeModel.get('inner_content');
			if ( innerContent ) {
				innerContent.set('value', options.content)
			}
		}

		return shortcodeModel;

	},

	/**
	 * Fetch preview.
	 * Async. Sets this.content and calls this.render.
	 *
	 * @return undefined
	 */
	renderPreview : function() {

		var view;

		var shortcode = this.shortcodeModel;
		view = getEditView( shortcode.get('shortcode_tag') );
		view = new view( { model: shortcode } );

		this.content = view.render().$el;
		this.render( null, true );

		shortcode.on('change', function() {
			console.log( shortcode.formatShortcode() );
		} );

	},

	/**
	 * Edit shortcode.
	 * Get shortcode model and open edit modal.
	 *
	 */
	edit : function( shortcodeString ) {

		var currentShortcode;

		// Backwards compatability for WP pre-4.2
		if ( 'object' === typeof( shortcodeString ) ) {
			shortcodeString = decodeURIComponent( $(shortcodeString).attr('data-wpview-text') );
		}

		currentShortcode = this.parseShortcodeString( shortcodeString );

		if ( currentShortcode ) {

			var wp_media_frame = wp.media.frames.wp_media_frame = wp.media({
				frame : "post",
				state : 'shortcode-ui',
				currentShortcode : currentShortcode,
			});

			wp_media_frame.open();

		}

	},

	/**
	 * Parse a shortcode string and return shortcode model.
	 * Must be a registered shortcode - see window.Shortcode_UI.shortcodes.
	 *
	 * @todo - I think there must be a cleaner way to get the
	 * shortcode & args here that doesn't use regex.
	 *
	 * @param  string shortcodeString
	 * @return Shortcode
	 */
	parseShortcodeString: function( shortcodeString ) {

		var model, attr;

		var megaRegex = /\[([^\s\]]+)([^\]]+)?\]([^\[]*)?(\[\/(\S+?)\])?/;
		var matches = shortcodeString.match( megaRegex );

		if ( ! matches ) {
			return;
		}

		defaultShortcode = sui.shortcodes.findWhere({
			shortcode_tag : matches[1]
		});

		if ( ! defaultShortcode ) {
			return;
		}

		currentShortcode = defaultShortcode.clone();

		if ( matches[2] ) {

			var attributeRegex = /(\w+)\s*=\s*"([^"]*)"(?:\s|$)|(\w+)\s*=\s*\'([^\']*)\'(?:\s|$)|(\w+)\s*=\s*([^\s\'"]+)(?:\s|$)|"([^"]*)"(?:\s|$)|(\S+)(?:\s|$)/gmi;
			attributeMatches   = matches[2].match( attributeRegex ) || [];

			// Trim whitespace from matches.
			attributeMatches = attributeMatches.map( function( match ) {
				return match.replace( /^\s+|\s+$/g, '' );
			} );

			// convert attribute strings to object.
			for ( var i = 0; i < attributeMatches.length; i++ ) {

				var bitsRegEx = /(\S+?)=(.*)/g;
				var bits = bitsRegEx.exec( attributeMatches[i] );

				if ( bits && bits[1] ) {

					attr = currentShortcode.get( 'attrs' ).findWhere({
						attr : bits[1]
					});

					// If attribute found - set value.
					// Trim quotes from beginning and end.
					if ( attr ) {
						attr.set( 'value', bits[2].replace( /^"|^'|"$|'$/gmi, "" ) );
					}

				}
			}

		}

		if ( matches[3] ) {
			var inner_content = currentShortcode.get( 'inner_content' );
			inner_content.set( 'value', this.unAutoP( matches[3] ) );
		}

		return currentShortcode;

	},

 	/**
	 * Strip 'p' and 'br' tags, replace with line breaks.
	 * Reverse the effect of the WP editor autop functionality.
	 */
	unAutoP: function( content ) {
		if ( switchEditors && switchEditors.pre_wpautop ) {
			content = switchEditors.pre_wpautop( content );
		}
		return content;
	},

};

module.exports = shortcodeViewConstructor;
