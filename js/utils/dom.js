/**
 * DOM manipulation utilities.
 */
var Dom = {
	/**
	 *
	 *
	 * @class sui.dom.IFrame
	 */
	IFrame : {
		template : wp.template('iframe-doc'),

		/**
		 * Creates an <iframe> appended to the `$parent` node. Manages <iframe> content updates and state.
		 *
		 * @method create
		 * @static
		 * @param $parent jQuery object to which <iframe> should be appended.
		 * @param [options.body] HTML content for insertion into the &lt;iframe> body.
		 * @param [options.head] Markup for insertion into the &lt;iframe> head.
		 */
		create : function($parent, options) {
			var iframe = document.createElement('iframe');

			iframe.src = tinymce.Env.ie ? 'javascript:""' : '';
			iframe.frameBorder = '0';
			iframe.allowTransparency = 'true';
			iframe.scrolling = 'no';
			$(iframe).css({
				width : '100%',
				display : 'block'
			});

			iframe.onload = function() {
				if (options.write !== false) {
					sui.dom.IFrame.write(iframe, options);
				}
			};

			$parent.append(iframe);

			return iframe;
		},

		/**
		 * Write a new document to the target iframe.
		 *
		 * @param iframe
		 * @param params
		 * 	@param params.head {String}
		 * 	@param params.body {String}
		 * 	@param params.body_classes {String}
		 */
		write : function(iframe, params) {
			var doc;

			_.defaults(params || {}, {
				'head' : '',
				'body' : '',
				'body_classes' : ''
			});

			if (!(doc = iframe.contentWindow && iframe.contentWindow.document)) {
				throw new Error("Cannot write to iframe that is not ready.");
			}

			doc.open();
			doc.write(sui.dom.IFrame.template(params));
			doc.close();
		},

		/**
		 * If the `MutationObserver` class is available, observe the target iframe and execute the callback upon
		 * mutation. If the `MutationObserver` class is not available, execute the callback after a timeout (light
		 * poling).
		 *
		 * @param iframe
		 * @param callback
		 * @returns {MutationObserver|false}
		 */
		observe : function(iframe, callback) {
			var MutationObserver = window.MutationObserver
					|| window.WebKitMutationObserver
					|| window.MozMutationObserver;
			var observer = false;
			var doc;

			if (MutationObserver
					&& (doc = (iframe.contentWindow && iframe.contentWindow.document))) {
				observer = new MutationObserver(callback);
				observer.observe(doc.body, {
					attributes : true,
					childList : true,
					subtree : true
				});
			} else {
				for (i = 1; i < 6; i++) {
					setTimeout(callback, i * 700);
				}
			}

			return observer;
		}
	}
};

module.exports = Dom;