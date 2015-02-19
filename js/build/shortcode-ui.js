(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var ShortcodeAttribute = require('./../models/shortcode-attribute.js');

console.log( ShortcodeAttribute );

/**
 * Shortcode Attributes collection.
 */
var ShortcodeAttributes = Backbone.Collection.extend({
	model : ShortcodeAttribute,
	//  Deep Clone.
	clone : function() {
		return new this.constructor(_.map(this.models, function(m) {
			return m.clone();
		}));
	}
});

module.exports = ShortcodeAttributes;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode-attribute.js":4}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var Shortcode = require('./../models/shortcode.js');


// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":5}],3:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);

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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		placeholder: '',
	},
});

module.exports = ShortcodeAttribute;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var ShortcodeAttributes = require('./../collections/shortcode-attributes.js');

var Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: ShortcodeAttributes,
	},

	/**
	 * Custom set method.
	 * Handles setting the attribute collection.
	 */
	set: function( attributes, options ) {

		if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof ShortcodeAttributes ) ) {
			attributes.attrs = new ShortcodeAttributes( attributes.attrs );
		}

		return Backbone.Model.prototype.set.call(this, attributes, options);
	},

	/**
	 * Custom toJSON.
	 * Handles converting the attribute collection to JSON.
	 */
	toJSON: function( options ) {
		options = Backbone.Model.prototype.toJSON.call(this, options);
		if ( options.attrs !== undefined && ( options.attrs instanceof ShortcodeAttributes ) ) {
			options.attrs = options.attrs.toJSON();
		}
		return options;
	},

	/**
	 * Custom clone
	 * Make sure we don't clone a reference to attributes.
	 */
	clone: function() {
		var clone = Backbone.Model.prototype.clone.call( this );
		clone.set( 'attrs', clone.get( 'attrs' ).clone() );
		return clone;
	},

	/**
	 * Get the shortcode as... a shortcode!
	 *
	 * @return string eg [shortcode attr1=value]
	 */
	formatShortcode: function() {

		var template, shortcodeAttributes, attrs = [], content;

		this.get( 'attrs' ).each( function( attr ) {

			// Skip empty attributes.
			if ( ! attr.get( 'value' ) ||  attr.get( 'value' ).length < 1 ) {
				return;
			}

			// Handle content attribute as a special case.
			if ( attr.get( 'attr' ) === 'content' ) {
				content = attr.get( 'value' );
			} else {
				attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );
			}

		} );

		template = "[{{ shortcode }} {{ attributes }}]"

		if ( content && content.length > 0 ) {
			template += "{{ content }}[/{{ shortcode }}]"
		}

		template = template.replace( /{{ shortcode }}/g, this.get('shortcode_tag') );
		template = template.replace( /{{ attributes }}/g, attrs.join( ' ' ) );
		template = template.replace( /{{ content }}/g, content );

		return template;

	}

});

module.exports = Shortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcode-attributes.js":1}],6:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
	Shortcodes = require('./collections/shortcodes.js'),
	shortcodeViewConstructor = require('./utils/shortcode-view-constructor.js')

	
sui = {};

jQuery(document).ready(function(){
	console.log( shortcodeUIData.shortcodes );
	var shortcodes = new Shortcodes( shortcodeUIData.shortcodes )
	sui.shortcodes = shortcodes;
	
	shortcodes.each( function( shortcode ) {
		if( wp.mce.views ) {
			// Register the mce view for each shortcode.
			// Note - clone the constructor.
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				$.extend( true, {}, shortcodeViewConstructor )
			);
		}
	} );

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./collections/shortcodes.js":2,"./utils/shortcode-view-constructor.js":8}],7:[function(require,module,exports){
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
					Dom.IFrame.write(iframe, options);
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
			doc.write(Dom.IFrame.template(params));
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
},{}],8:[function(require,module,exports){
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

						if (attr.get('attr') === 'content'
								&& ('content' in options.shortcode)) {
							attr.set('value', options.shortcode.content);
						}

					});

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
		 * To ensure consistent rendering - this makes an ajax request to the admin and displays.
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
	 * @todo - I think there must be a cleaner way to get
	 * the shortcode & args here that doesn't use regex.
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
			var content = currentShortcode.get('attrs').findWhere({
				attr : 'content'
			});
			if (content) {
				content.set('value', matches[3]);
			}
		}

		var wp_media_frame = wp.media.frames.wp_media_frame = wp.media({
			frame : "post",
			state : 'shortcode-ui',
			currentShortcode : currentShortcode,
		});

		wp_media_frame.open();

	}

};

module.exports = shortcodeViewConstructor;
},{}],9:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var EditAttributeField = Backbone.View.extend( {

	tagName: "div",

	events: {
		'keyup  input[type="text"]':   'updateValue',
		'keyup  textarea':             'updateValue',
		'change select':               'updateValue',
		'change input[type=checkbox]': 'updateValue',
		'change input[type=radio]':    'updateValue',
		'change input[type=email]':    'updateValue',
		'change input[type=number]':   'updateValue',
		'change input[type=date]':     'updateValue',
		'change input[type=url]':      'updateValue',
	},

	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );
		return this
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model.
	 */
	updateValue: function( e ) {
		var $el = $(this.el).find( '[name=' + this.model.get( 'attr' ) + ']' );
		this.model.set( 'value', $el.val() );
	},

} );

module.exports = EditAttributeField;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);
var EditAttributeField = require('./edit-attribute-field');

/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template : wp.template('shortcode-default-edit-form'),

	initialize : function(options) {

		var t = this;
		this.model.get('attrs').each(function(attr) {
			// Get the field settings from localization data.
			var type = attr.get('type');

			if (!shortcodeUIFieldData[type]) {
				return;
			}

			var viewObjName = shortcodeUIFieldData[type].view;
			var tmplName = shortcodeUIFieldData[type].template;
			
			//@todo: figure out a way to load the view dynamically. 
			//var tmplView = require('sui-views/' + viewObjName);

			var view = new EditAttributeField({
				model : attr
			});
			view.template = wp.media.template(tmplName);
			view.shortcode = t.model;

			t.views.add('.edit-shortcode-form-fields', view);

		});

	},

});

module.exports = EditShortcodeForm;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./edit-attribute-field":9}],11:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);

/**
 * Single shortcode list item view.
 */
var InsertShortcodeListItem = wp.Backbone.View.extend({

	tagName : 'li',
	template : wp.template('add-shortcode-list-item'),
	className : 'shortcode-list-item',

	render : function() {

		var data = this.model.toJSON();
		this.$el.attr('data-shortcode', data.shortcode_tag);

		if (('listItemImage' in data)
				&& 0 === data.listItemImage.indexOf('dashicons-')) {
			data.listItemImage = '<div class="dashicons ' + data.listItemImage
					+ '"></div>';
		}

		this.$el.html(this.template(data));

		return this;

	}
});

module.exports = InsertShortcodeListItem;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],12:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null);
var InsertShortcodeListItem = require('./insert-shortcode-list-item.js');

var InsertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function(options) {

		var t = this;

		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new InsertShortcodeListItem({
				model : shortcode
			}));
		});

	},

});

module.exports = InsertShortcodeList;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./insert-shortcode-list-item.js":11}],13:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window.wp : typeof global !== "undefined" ? global.wp : null),
	MediaController = require('./../controllers/media-controller.js'),
	Shortcode_UI = require('./shortcode-ui');

var shortcodeFrame = wp.media.view.MediaFrame.Post;
wp.media.view.MediaFrame.Post = shortcodeFrame.extend({

	initialize: function() {

		shortcodeFrame.prototype.initialize.apply( this, arguments );

		var id = 'shortcode-ui';

		var opts = {
			id      : id,
			router  : false,
			toolbar : id + '-toolbar',
			menu    : 'default',
			title   : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs    : [ 'insert' ],
			priority:  66,
			content : id + '-content-insert',
		};

		if ( 'currentShortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label;
		}

		var controller = new MediaController( opts );

		if ( 'currentShortcode' in this.options ) {
			controller.props.set( 'currentShortcode', arguments[0].currentShortcode );
			controller.props.set( 'action', 'update' );
		}

		this.states.add([ controller]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	contentRender : function( id, tab ) {
		this.content.set(
			new Shortcode_UI( {
				controller: this,
				className:  'clearfix ' + id + '-content ' + id + '-content-' + tab
			} )
		);
	},

	toolbarRender: function( toolbar ) {},

	toolbarCreate : function( toolbar ) {
		var text = shortcodeUIData.strings.media_frame_toolbar_insert_label;
		if ( 'currentShortcode' in this.options ) {
			text = shortcodeUIData.strings.media_frame_toolbar_update_label;
		}

		toolbar.view = new  wp.media.view.Toolbar( {
			controller : this,
			items: {
				insert: {
					text: text,
					style: 'primary',
					priority: 80,
					requires: false,
					click: this.insertAction,
				}
			}
		} );
	},

	renderShortcodeUIMenu: function( view ) {

		// Add a menu separator link.
		view.set({
			'shortcode-ui-separator': new wp.media.View({
				className: 'separator',
				priority: 65
			})
		});

		// Hide menu if editing.
		// @todo - fix this.
		// This is a hack.
		// I just can't work out how to do it properly...
		if (
			view.controller.state().props
			&& view.controller.state().props.get( 'currentShortcode' )
		) {
			window.setTimeout( function() {
				view.controller.$el.addClass( 'hide-menu' );
			} );
		}

	},

	insertAction: function() {
		this.controller.state().insert();
	},

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../controllers/media-controller.js":3,"./shortcode-ui":15}],14:[function(require,module,exports){
(function (global){
var Backbonen = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	Dom = require('./../utils/dom.js')


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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/dom.js":7}],15:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	InsertShortcodeList = require('./insert-shortcode-list.js'),
	TabbedView = require('./tabbed-view.js'),
	ShortcodePreview = require('./shortcode-preview.js'),
	EditShortcodeForm = require('./edit-shortcode-form.js')
	$ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

var Shortcode_UI = Backbone.View.extend({
	events: {
		"click .add-shortcode-list li":      "select",
		"click .edit-shortcode-form-cancel": "cancelSelect"
	},

	initialize: function(options) {
		this.controller = options.controller.state();
	},

	render: function() {

		this.$el.html('');

		switch( this.controller.props.get('action') ) {
			case 'select' :
				this.renderSelectShortcodeView();
				break;
			case 'update' :
			case 'insert' :
				this.renderEditShortcodeView();
				break;
		}

	},

	renderSelectShortcodeView: function() {
		this.views.unset();
		this.views.add(
			'',
			new InsertShortcodeList( { shortcodes: sui.shortcodes } )
		);
	},

	renderEditShortcodeView: function() {
		var shortcode = this.controller.props.get( 'currentShortcode' );
		var view = new TabbedView({
			tabs: {
				edit: {
					label: shortcodeUIData.strings.edit_tab_label,
					content: new EditShortcodeForm({ model: shortcode })
				},

				preview: {
					label: shortcodeUIData.strings.preview_tab_label,
					content: new ShortcodePreview({ model: shortcode }),
					open: function() {
						this.render();
					}
				}
			},

			styles: {
				group:	'media-router edit-shortcode-tabs',
				tab:	'media-menu-item edit-shortcode-tab'
			}
		});

		this.$el.append( view.render().el );

		if ( this.controller.props.get('action') === 'update' ) {
			this.$el.find( '.edit-shortcode-form-cancel' ).remove();
		}

		return this;

	},

	cancelSelect: function() {
		this.controller.props.set( 'action', 'select' );
		this.controller.props.set( 'currentShortcode', null );
		this.render();
	},

	select: function(e) {
		this.controller.props.set( 'action', 'insert' );
		var target    = $(e.currentTarget).closest( '.shortcode-list-item' );
		var shortcode = sui.shortcodes.findWhere( { shortcode_tag: target.attr( 'data-shortcode' ) } );

		if ( ! shortcode ) {
			return;
		}

		this.controller.props.set( 'currentShortcode', shortcode.clone() );

		this.render();

	},

});

module.exports = Shortcode_UI;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./edit-shortcode-form.js":10,"./insert-shortcode-list.js":12,"./shortcode-preview.js":14,"./tabbed-view.js":16}],16:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

/**
 * Abstraction to manage tabbed content. Tab parameters (e.g., label) along with
 * views for associated content are passed to initialize the tabbed view.
 * 
 * @class TabbedView
 * @constructor
 * @extends Backbone.View
 * @params [options]
 * @params [options.tabs] {Object} A hash of key:value pairs, where each value
 *         is itself an object with the following properties:
 * 
 * label: The label to display on the tab. content: The `Backbone.View`
 * associated with the tab content.
 */
var TabbedView = Backbone.View.extend({
	template : wp.template('tabbed-view-base'),
	tabs : {},

	events : {
		'click [data-role="tab"]' : function(event) {
			this.tabSwitcher(event);
		}
	},

	initialize : function(options) {
		Backbone.View.prototype.initialize.apply(this, arguments);

		_.defaults(this.options = (options || {}), {
			styles : {
				group : '',
				tab : ''
			}
		});

		this.tabs = _.extend(this.tabs, options.tabs);
	},

	/**
	 * @method render
	 * @chainable
	 * @returns {TabbedView}
	 */
	render : function() {
		var $content;

		this.$el.html(this.template({
			tabs : this.tabs,
			styles : this.options.styles
		}));

		$content = this.$('[data-role="tab-content"]');
		$content.empty();

		_.each(this.tabs, function(tab) {
			var $el = tab.content.render().$el;
			$el.hide();
			$content.append($el);
		});

		this.select(0);

		return this;
	},

	/**
	 * Switches tab when previewing or editing
	 */
	tabSwitcher : function(event) {
		event.stopPropagation();
		event.preventDefault();

		var target = $(event.currentTarget).attr('data-target');

		this.select(target);
	},

	/**
	 * Programmatically select (activate) a specific tab. Used internally to
	 * process tab click events.
	 * 
	 * @method select
	 * @param selector
	 *            {number|string} The index (zero based) or key of the target
	 *            tab.
	 */
	select : function(selector) {
		var index = 0;
		var target = null;
		var tab;

		selector = selector || 0;

		_.each(this.tabs, function(tab, key) {
			tab.content.$el.hide();

			if (selector === key || selector === index) {
				target = key;
			}

			index = index + 1;
		});

		this.$('[data-role="tab"]').removeClass('active');

		if (target) {
			tab = this.tabs[target];

			this.$('[data-role="tab"][data-target="' + target + '"]').addClass(
					'active');

			tab.content.$el.show();
			(typeof tab.open == 'function') && tab.open.call(tab.content);
		}
	}
});

module.exports = TabbedView;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);
