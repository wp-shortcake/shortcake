/**
 * Generic shortcode mce view constructor.
 * This is cloned and used by each shortcode when registering a view.
 */
var shortcodeViewConstructor = {

	View : {

		shortcodeHTML : false,

		initialize : function(options) {

			var shortcodeModel = sui.shortcodes.findWhere({
				shortcode_tag : options.shortcode.tag
			});

			if (!shortcodeModel) {
				return;
			}

			shortcode = shortcodeModel.clone();

			shortcode.get('attrs').each(
					function(attr) {

						if (attr.get('attr') in options.shortcode.attrs.named) {
							attr.set('value',
									options.shortcode.attrs.named[attr
											.get('attr')]);
						}

					});

			if ('content' in options.shortcode) {
				var inner_content = shortcode.get('inner_content');
				inner_content.set('value', options.shortcode.content)
			}

			this.shortcode = shortcode;

			this.fetch();
		},

		fetch : function() {

			var self = this;

			wp.ajax.post('do_shortcode', {
				post_id : $('#post_ID').val(),
				shortcode : this.shortcode.formatShortcode(),
				nonce : shortcodeUIData.nonces.preview,
			}).done(function(response) {
				self.parsed = response;
				self.render(true);
			}).fail(
					function() {
						self.parsed = '<span class="shortcake-error">'
								+ shortcodeUIData.strings.mce_view_error
								+ '</span>';
						self.render(true);
					});

		},

		/**
		 * Render the shortcode
		 * 
		 * To ensure consistent rendering - this makes an ajax request to the
		 * admin and displays.
		 * 
		 * @return string html
		 */
		getHtml : function() {
			return this.parsed;
		}

	},

	/**
	 * Edit shortcode.
	 * 
	 * Parses the shortcode and creates shortcode mode.
	 * 
	 * @todo - I think there must be a cleaner way to get the shortcode & args
	 *       here that doesn't use regex.
	 */
	edit : function(node) {

		var shortcodeString, model, attr;

		shortcodeString = decodeURIComponent($(node).attr('data-wpview-text'));

		var megaRegex = /\[([^\s\]]+)([^\]]+)?\]([^\[]*)?(\[\/(\S+?)\])?/;
		var matches = shortcodeString.match(megaRegex);

		if (!matches) {
			return;
		}

		defaultShortcode = sui.shortcodes.findWhere({
			shortcode_tag : matches[1]
		});

		if (!defaultShortcode) {
			return;
		}

		currentShortcode = defaultShortcode.clone();

		if (matches[2]) {

			attributeMatches = matches[2].match(/(\S+?=".*?")/g) || [];

			// convert attribute strings to object.
			for (var i = 0; i < attributeMatches.length; i++) {

				var bitsRegEx = /(\S+?)="(.*?)"/g;
				var bits = bitsRegEx.exec(attributeMatches[i]);

				attr = currentShortcode.get('attrs').findWhere({
					attr : bits[1]
				});
				if (attr) {
					attr.set('value', bits[2]);
				}

			}

		}

		if (matches[3]) {
			var inner_content = currentShortcode.get('inner_content');
			inner_content.set('value', matches[3]);
		}

		var wp_media_frame = wp.media.frames.wp_media_frame = wp.media({
			frame : "post",
			state : 'shortcode-ui',
			currentShortcode : currentShortcode,
		});

		wp_media_frame.open();

	}

};

sui.utils.shortcodeViewConstructor = shortcodeViewConstructor;
module.exports = shortcodeViewConstructor;