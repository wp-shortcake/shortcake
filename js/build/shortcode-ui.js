(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ShortcodeAttribute = require('./../models/shortcode-attribute.js');

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
	},

});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode-attribute.js":5}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Shortcode = require('./../models/shortcode.js');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":6}],3:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
    wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
    sui = require('./../utils/sui.js'),
    Shortcodes = require('./../collections/shortcodes.js');

var MediaController = wp.media.controller.State.extend({

	initialize: function(){

		this.props = new Backbone.Model({
			currentShortcode: null,
			action: 'select',
			search: null
		});

		this.props.on( 'change:action', this.refresh, this );

	},

	refresh: function() {
		if ( this.frame && this.frame.toolbar ) {
			this.frame.toolbar.get().refresh();
		}
	},

	search: function( searchTerm ) {
		var pattern = new RegExp( searchTerm, "gi" );
		var filteredModels = sui.shortcodes.filter( function( model ) {
			pattern.lastIndex = 0;
			return pattern.test( model.get( "label" ) );
		});
		return filteredModels;
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
		this.props.set( 'search', null );
	},

});

sui.controllers.MediaController = MediaController;
module.exports = MediaController;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcodes.js":2,"./../utils/sui.js":10}],4:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

/**
 * Shortcode Attribute Model.
 */
var InnerContent = Backbone.Model.extend({
	defaults : {
		label:       shortcodeUIData.strings.insert_content_label,
		type:        'textarea',
		value:       '',
		placeholder: '',
	},
});

module.exports = InnerContent;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);

var ShortcodeAttribute = Backbone.Model.extend({

	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		encode:      false,
		meta: {
			placeholder: '',
		},
	},

});

module.exports = ShortcodeAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var ShortcodeAttributes = require('./../collections/shortcode-attributes.js');
var InnerContent = require('./inner-content.js');
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: new ShortcodeAttributes(),
		attributes_backup: {},
	},

	/**
	 * Custom set method.
	 * Handles setting the attribute collection.
	 */
	set: function( attributes, options ) {

		if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof ShortcodeAttributes ) ) {
			attributes.attrs = new ShortcodeAttributes( attributes.attrs );
		}

		if ( attributes.inner_content && ! ( attributes.inner_content instanceof InnerContent ) ) {
			attributes.inner_content = new InnerContent( attributes.inner_content );
		}

		return Backbone.Model.prototype.set.call(this, attributes, options);
	},

	/**
	 * Custom toJSON.
	 * Handles converting the attribute collection to JSON.
	 */
	toJSON: function( options ) {
		options = Backbone.Model.prototype.toJSON.call(this, options);
		if ( options.attrs && ( options.attrs instanceof ShortcodeAttributes ) ) {
			options.attrs = options.attrs.toJSON();
		}
		if ( options.inner_content && ( options.inner_content instanceof InnerContent ) ) {
			options.inner_content = options.inner_content.toJSON();
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
		if ( clone.get( 'inner_content' ) ) {
			clone.set( 'inner_content', clone.get( 'inner_content' ).clone() );
		}
		return clone;
	},

	/**
	 * Get the shortcode as... a shortcode!
	 *
	 * @return string eg [shortcode attr1=value]
	 */
	formatShortcode: function() {

		var template, shortcodeAttributes, attrs = [], content, self = this;

		this.get( 'attrs' ).each( function( attr ) {

			// Skip empty attributes.
			if ( ! attr.get( 'value' ) ||  attr.get( 'value' ).length < 1 ) {
				return;
			}

			// Encode textareas incase HTML
			if ( attr.get( 'encode' ) ) {
				attr.set( 'value', encodeURIComponent( decodeURIComponent( attr.get( 'value' ).replace( "%", "&#37;" ) ) ), { silent: true } );
			}

			attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );

		} );

		$.each( this.get( 'attributes_backup' ), function( key, value){
			attrs.push( key + '="' + value + '"' );
		});

		if ( this.get( 'inner_content' ) ) {
			content = this.get( 'inner_content' ).get( 'value' );
		} else if ( this.get( 'inner_content_backup' ) ) {
			content = this.get( 'inner_content_backup' );
		}

		if ( attrs.length > 0 ) {
			template = "[{{ shortcode }} {{ attributes }}";
		} else {
			template = "[{{ shortcode }}";
		}

		if ( content && content.length > 0 ) {
			template += "]{{ content }}[/{{ shortcode }}]";
		} else {
			// add closing slash to shortcodes without content
			template += "/]";
		}

		template = template.replace( /{{ shortcode }}/g, this.get('shortcode_tag') );
		template = template.replace( /{{ attributes }}/g, attrs.join( ' ' ) );
		template = template.replace( /{{ content }}/g, content );

		return template;

	},
});

module.exports = Shortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcode-attributes.js":1,"./inner-content.js":4}],7:[function(require,module,exports){
(function (global){
var sui = require('./utils/sui.js'),
	Shortcodes = require('./collections/shortcodes.js'),
	shortcodeViewConstructor = require('./utils/shortcode-view-constructor.js'),
	mediaFrame = require('./views/media-frame.js'),
	wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

$(document).ready(function(){

	// Create collection of shortcode models from data.
	sui.shortcodes.add( shortcodeUIData.shortcodes );

	wp.media.view.MediaFrame.Post = mediaFrame;

	// Register a view for each shortcode.
	sui.shortcodes.each( function( shortcode ) {
		if ( wp.mce.views ) {
			wp.mce.views.register(
				shortcode.get('shortcode_tag'),
				shortcodeViewConstructor
			);
		}
	} );

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./collections/shortcodes.js":2,"./utils/shortcode-view-constructor.js":9,"./utils/sui.js":10,"./views/media-frame.js":20}],8:[function(require,module,exports){
(function (global){
var $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

/**
 * A Utility object for batching requests for shortcode previews.
 *
 * Returns a "singleton" object with two methods, `queueToFetch` and
 * `fetchAll`. Calling `Fetcher.queueToFetch()` will add the requested query to
 * the fetcher's array, and set a timeout to run all queries after the current
 * call stack has finished.
 *
 * @this {Fetcher} aliased as `fetcher`
 */
var Fetcher = (function() {
	var fetcher = this;

	/*
	 * Counter, used to match each request in a batch with its response.
	 * @private
	 */
	this.counter = 0;

	/*
	 * Array of queries to be executed in a batch.
	 * @private
	 */
	this.queries = [];

	/*
	 * The timeout for the current batch request.
	 * @private
	 */
	this.timeout = null;

	/**
	 * Add a query to the queue.
	 *
	 * Adds the requested query to the next batch. Either sets a timeout to
	 * fetch previews, or adds to the current one if one is already being
	 * built. Returns a jQuery Deferred promise that will be resolved when the
	 * query is successful or otherwise complete.
	 *
	 * @param {object} query Object containing fields required to render preview: {
	 *   @var {integer} post_id Post ID
	 *   @var {string} shortcode Shortcode string to render
	 *   @var {string} nonce Preview nonce
	 * }
	 * @return {Deferred}
	 */
	this.queueToFetch = function( query ) {
		var fetchPromise = new $.Deferred();

		query.counter = ++fetcher.counter;

		fetcher.queries.push({
			promise: fetchPromise,
			query: query,
			counter: query.counter
		});

		if ( ! fetcher.timeout ) {
			fetcher.timeout = setTimeout( fetcher.fetchAll );
		}

		return fetchPromise;
	};

	/**
	 * Execute all queued queries.
	 *
	 * Posts to the `bulk_do_shortcode` ajax endpoint to retrieve any queued
	 * previews. When that request recieves a response, goes through the
	 * response and resolves each of the promises in it.
	 *
	 * @this {Fetcher}
	 */
	this.fetchAll = function() {
		delete fetcher.timeout;

		if ( 0 === fetcher.queries.length ) {
			return;
		}

		var request = $.post( ajaxurl + '?action=bulk_do_shortcode', {
				queries: _.pluck( fetcher.queries, 'query' )
			}
		);

		request.done( function( response ) {
			_.each( response.data, function( result, index ) {
				var matchedQuery = _.findWhere( fetcher.queries, {
					counter: parseInt( index ),
				});

				if ( matchedQuery ) {
					fetcher.queries = _.without( fetcher.queries, matchedQuery );
					matchedQuery.promise.resolve( result );
				}
			} );
		} );
	};

	// Public API methods available
	return {
		queueToFetch : this.queueToFetch,
		fetchAll     : this.fetchAll
	};

})();

module.exports = Fetcher;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],9:[function(require,module,exports){
(function (global){
var sui = require('./sui.js'),
	fetcher = require('./fetcher.js'),
	wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Generic shortcode MCE view constructor.
 *
 * A Backbone-like View constructor intended for use when rendering a TinyMCE View.
 * The main difference is that the TinyMCE View is not tied to a particular DOM node.
 * This is cloned and used by each shortcode when registering a view.
 *
 */
var shortcodeViewConstructor = {

	/**
	 * Initialize a shortcode preview View.
	 *
	 * Fetches the preview by making a delayed Ajax call, and renders if a preview can be fetched.
	 *
	 * @constructor
	 * @this {Shortcode} Model registered with sui.shortcodes
	 * @param {Object} options Options
	 */
	initialize: function( options ) {
		var self = this;

		this.shortcodeModel = this.getShortcodeModel( this.shortcode );
		this.fetching = this.delayedFetch();

		this.fetching.done( function( queryResponse ) {
			var response = queryResponse.response;
			if ( '' === response ) {
				var span = $('<span />').addClass('shortcake-notice shortcake-empty').text( self.shortcodeModel.formatShortcode() );
				var wrapper = $('<div />').html( span );
				self.content = wrapper.html();
			} else {
				self.content = response;
			}
		}).fail( function() {
			var span = $('<span />').addClass('shortcake-error').text( shortcodeUIData.strings.mce_view_error );
			var wrapper = $('<div />').html( span );
			self.content = wrapper.html();
		} ).always( function() {
			delete self.fetching;
			self.render( null, true );
		} );
	},

	/**
	 * Get the shortcode model given the view shortcode options.
	 *
	 * If the shortcode found in the view is registered with Shortcake, this
	 * will clone the shortcode's Model and assign appropriate attribute
	 * values.
	 *
	 * @this {Shortcode}
	 * @param {Object} options Options formatted as wp.shortcode.
	 */
	getShortcodeModel: function( options ) {
		var shortcodeModel;

		shortcodeModel = sui.shortcodes.findWhere( { shortcode_tag: options.tag } );

		if ( ! shortcodeModel ) {
			return;
		}

		currentShortcode = shortcodeModel.clone();

		var attributes_backup = {};
		var attributes = options.attrs;
		for ( var key in attributes.named ) {

			if ( ! attributes.named.hasOwnProperty( key ) ) {
				continue;
			}

			value = attributes.named[ key ];
			attr  = currentShortcode.get( 'attrs' ).findWhere({ attr: key });

			// Reverse the effects of wpautop: https://core.trac.wordpress.org/ticket/34329
			value = this.unAutoP( value );

			if ( attr && attr.get('encode') ) {
				value = decodeURIComponent( value );
				value = value.replace( "&#37;", "%" );
			}

			if ( attr ) {
				attr.set( 'value', value );
			} else {
				attributes_backup[ key ] = value;
			}
		}

		currentShortcode.set( 'attributes_backup', attributes_backup );

		if ( options.content ) {
			var inner_content = currentShortcode.get( 'inner_content' );
			// Reverse the effects of wpautop: https://core.trac.wordpress.org/ticket/34329
			options.content = this.unAutoP( options.content );
			if ( inner_content ) {
				inner_content.set( 'value', options.content );
			} else {
				currentShortcode.set( 'inner_content_backup', options.content );
			}
		}

		return currentShortcode;
	},

	/**
	 * Queue a request with Fetcher class, and return a promise.
	 *
	 * @return {Promise}
	 */
	delayedFetch: function() {
		return fetcher.queueToFetch({
			post_id: $( '#post_ID' ).val(),
			shortcode: this.shortcodeModel.formatShortcode(),
			nonce: shortcodeUIData.nonces.preview,
		});
	},

	/**
	 * Fetch a preview of a single shortcode.
	 *
	 * Async. Sets this.content and calls this.render.
	 *
	 * @return undefined
	 */
	fetch: function() {
		var self = this;

		if ( ! this.fetching ) {
			this.fetching = true;

			wp.ajax.post( 'do_shortcode', {
				post_id: $( '#post_ID' ).val(),
				shortcode: this.shortcodeModel.formatShortcode(),
				nonce: shortcodeUIData.nonces.preview,
			}).done( function( response ) {
				if ( '' === response ) {
					self.content = '<span class="shortcake-notice shortcake-empty">' + self.shortcodeModel.formatShortcode() + '</span>';
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
	},

	/**
	 * Get the shortcode model and open modal UI for editing.
	 *
	 * @param {string} shortcodeString String representation of the shortcode
	 */
	edit: function( shortcodeString ) {

		var currentShortcode = this.parseShortcodeString( shortcodeString );

		if ( currentShortcode ) {

			var wp_media_frame = wp.media.frames.wp_media_frame = wp.media({
				frame : "post",
				state : 'shortcode-ui',
				currentShortcode : currentShortcode,
			});

			wp_media_frame.open();

			/* Trigger render_edit */
			/*
			 * Action run after an edit shortcode overlay is rendered.
			 *
			 * Called as `shortcode-ui.render_edit`.
			 *
			 * @param shortcodeModel (object)
			 *           Reference to the shortcode model used in this overlay.
			 */
			var hookName = 'shortcode-ui.render_edit';
			var shortcodeModel = this.shortcodeModel;
			wp.shortcake.hooks.doAction( hookName, shortcodeModel );

		}

	},

	/**
	 * Parse a shortcode string and return shortcode model.
	 * Must be a shortcode which has UI registered with Shortcake - see
	 * `window.sui.shortcodes`.
	 *
	 * @todo - I think there must be a cleaner way to get the
	 * shortcode & args here that doesn't use regex.
	 *
	 * @param  {string} shortcodeString
	 * @return Shortcode
	 */
	parseShortcodeString: function( shortcodeString ) {
		var model, attr;

		var shortcode_tags = _.map( sui.shortcodes.pluck( 'shortcode_tag' ), this.pregQuote ).join( '|' );
		var regexp = wp.shortcode.regexp( shortcode_tags );
		regexp.lastIndex = 0;
		var matches = regexp.exec( shortcodeString );

		if ( ! matches ) {
			return;
		}

		defaultShortcode = sui.shortcodes.findWhere({
			shortcode_tag : matches[2]
		});

		if ( ! defaultShortcode ) {
			return;
		}

		var shortcode = wp.shortcode.fromMatch( matches );
		return this.getShortcodeModel( shortcode );
	},

 	/**
	 * Strip 'p' and 'br' tags, replace with line breaks.
	 *
	 * Reverses the effect of the WP editor autop functionality.
	 *
	 * @param {string} content Content with `<p>` and `<br>` tags inserted
	 * @return {string}
	 */
	unAutoP: function( content ) {
		if ( switchEditors && switchEditors.pre_wpautop ) {
			content = switchEditors.pre_wpautop( content );
		}

		return content;
	},

	/**
	 * Escape any special characters in a string to be used as a regular expression.
	 *
	 * JS version of PHP's preg_quote()
	 *
	 * @see http://phpjs.org/functions/preg_quote/
	 *
	 * @param {string} str String to parse
	 * @param {string} delimiter Delimiter character to be also escaped - not used here
	 * @return {string}
	 */
	pregQuote: function( str, delimiter ) {
		return String(str)
			.replace(
				new RegExp( '[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + ( delimiter || '' ) + '-]', 'g' ),
				'\\$&' );
	},

};

module.exports = sui.utils.shortcodeViewConstructor = shortcodeViewConstructor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./fetcher.js":8,"./sui.js":10}],10:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes(),
	views: {},
	controllers: {},
	utils: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":2}],11:[function(require,module,exports){
var sui = require('./../utils/sui.js');

var editAttributeFieldAttachment = sui.views.editAttributeField.extend( {

	events: {
		'click .add'       : '_openMediaFrame',
		'click .remove'    : '_removeAttachment',
		'click .thumbnail' : '_openMediaFrame',
		'selectAttachment' : '_selectAttachment',
	},

	/**
	 * Update the field attachment.
	 * Re-renders UI.
	 * If ID is empty - does nothing.
	 *
	 * @param {int} id Attachment ID
	 */
	updateValue: function( id ) {

		if ( ! id ) {
			return;
		}

		this.setValue( id );

		var self = this;

		if ( editAttributeFieldAttachment.getFromCache( id ) ) {
			self._renderPreview( editAttributeFieldAttachment.getFromCache( id ) );

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
			return;
		}

		this.$container.addClass( 'loading' );

		wp.ajax.post( 'get-attachment', {
			'id': id
		} ).done( function( attachment ) {
			// Cache for later.
			editAttributeFieldAttachment.setInCache( id, attachment );
			self._renderPreview( attachment );

			// Call the updateValue() function, to trigger any listeners
			// hooked on it.
			self.triggerCallbacks();
		} ).always( function( attachment ) {
			self.$container.removeClass( 'loading' );
		});
	},

	render: function() {

		// Set model default values.
		for ( var arg in ShortcakeImageFieldData.defaultArgs ) {
			if ( ! this.model.get( arg ) ) {
				this.model.set( arg, ShortcakeImageFieldData.defaultArgs[ arg ] );
			}
		}

		this.$el.html( this.template( this.model.toJSON() ) );

		this.$container   = this.$el.find( '.shortcake-attachment-preview' );
		this.$thumbnailDetailsContainer   = this.$el.find( '.thumbnail-details-container' );
		var $addButton    = this.$container.find( 'button.add' );

		this.frame = wp.media( {
			multiple: false,
			title: this.model.get( 'frameTitle' ),
			library: {
				type: this.model.get( 'libraryType' ),
			},
		} );

		// Add initial Attachment if available.
		this.updateValue( this.model.get( 'value' ) );

	},

	/**
	 * Renders attachment preview in field.
	 * @param {object} attachment model
	 * @return null
	 */
	_renderPreview: function( attachment ) {

		var $thumbnail = jQuery('<div class="thumbnail"></div>');

		if ( 'image' !== attachment.type ) {

			jQuery( '<img/>', {
				src: attachment.icon,
				alt: attachment.title,
			} ).appendTo( $thumbnail );

			jQuery( '<div/>', {
				class: 'filename',
				html:  '<div>' + attachment.title + '</div>',
			} ).appendTo( $thumbnail );

		} else {

			attachmentThumb = (typeof attachment.sizes.thumbnail !== 'undefined') ?
				attachment.sizes.thumbnail :
				_.first( _.sortBy( attachment.sizes, 'width' ) );

			jQuery( '<img/>', {
				src:    attachmentThumb.url,
				width:  attachmentThumb.width,
				height: attachmentThumb.height,
				alt:    attachment.alt,
			} ) .appendTo( $thumbnail );

		}

		$thumbnail.find( 'img' ).wrap( '<div class="centered"></div>' );
		this.$container.append( $thumbnail );
		this.$container.toggleClass( 'has-attachment', true );

		this.$thumbnailDetailsContainer.find( '.filename' ).text( attachment.filename );
		this.$thumbnailDetailsContainer.find( '.date-formatted' ).text( attachment.dateFormatted );
		this.$thumbnailDetailsContainer.find( '.size' ).text( attachment.filesizeHumanReadable );
		this.$thumbnailDetailsContainer.find( '.dimensions' ).text( attachment.height + ' × ' + attachment.width );
		this.$thumbnailDetailsContainer.find( '.edit-link a' ).attr( "href", attachment.editLink );
		this.$thumbnailDetailsContainer.toggleClass( 'has-attachment', true );

	},

	/**
	 * Open media frame when add button is clicked.
	 *
	 */
	_openMediaFrame: function(e) {
		e.preventDefault();
		this.frame.open();
		if ( this.model.get( 'value' ) ) {
			var selection = this.frame.state().get('selection');
			var attachment = wp.media.attachment( this.model.get( 'value' ) );
			attachment.fetch();
			selection.reset( attachment ? [ attachment ] : [] );
			this.frame.state().set('selection', selection);
		}

		var self = this;
		this.frame.on( 'select', function() {
			self.$el.trigger( 'selectAttachment'  );
		} );

	},

	/**
	 * When an attachment is selected from the media frame, update the model value.
	 *
	 */
	_selectAttachment: function(e) {
		var selection  = this.frame.state().get('selection'),
			attachment = selection.first();
		if ( attachment.id != this.model.get( 'value' ) ){
			this.model.set( 'value', null );
			this.$container.toggleClass( 'has-attachment', false );
			this.$container.find( '.thumbnail' ).remove();
			this.updateValue( attachment.id );
		}
		this.frame.close();
	},

	/**
	 * Remove the attachment.
	 * Render preview & Update the model.
	 */
	_removeAttachment: function(e) {
		e.preventDefault();

		this.model.set( 'value', null );
		this.triggerCallbacks();

		this.$container.toggleClass( 'has-attachment', false );
		this.$container.find( '.thumbnail' ).remove();
		this.$thumbnailDetailsContainer.toggleClass( 'has-attachment', false );
	},

}, {

	_idCache: {},

	/**
	 * Store attachments in a cache for quicker loading.
	 */
	setInCache: function( id, attachment ) {
		this._idCache[ id ] = attachment;
	},

	/**
	 * Retrieve an attachment from the cache.
	 */
	getFromCache: function( id ){
		if ( 'undefined' === typeof this._idCache[ id ] ) {
			return false;
		}
		return this._idCache[ id ];
	},

});

module.exports = sui.views.editAttributeFieldAttachment = editAttributeFieldAttachment;


},{"./../utils/sui.js":10}],12:[function(require,module,exports){
(function (global){
var sui = require('./../utils/sui.js'),
    editAttributeField = require('./edit-attribute-field.js'),
    $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

sui.views.editAttributeFieldColor = editAttributeField.extend({

	// All events are being listened by iris, and they don't bubble very well,
	// so remove Backbone's listeners.
	events: {},

	render: function() {
		var self = this;

		var data = jQuery.extend( {
			id: 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid,
		}, this.model.toJSON() );

		// Convert meta JSON to attribute string.
		var _meta = [];
		for ( var key in data.meta ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.meta[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.meta[ key ] ) {
					_meta.push( _.escape( key ) );
				}

			} else {

				_meta.push( _.escape( key ) + '="' + _.escape( data.meta[ key ] ) + '"' );

			}

		}

		data.meta = _meta.join( ' ' );

		this.$el.html( this.template( data ) );
		this.triggerCallbacks();

		this.$el.find('input[type="text"]:not(.wp-color-picker)').wpColorPicker({
			change: function(e, ui) {
				self.setValue( $(this).wpColorPicker('color') );
				self.triggerCallbacks();
			}
		});

		return this;
	}

});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./edit-attribute-field.js":16}],13:[function(require,module,exports){
( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var postSelectCache = {};

	sui.views.editAttributeFieldPostSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-post-select': 'inputChanged',
		},

		inputChanged: function(e) {
			var _selected = $( e.currentTarget ).val();

			// Store multiple selections as comma-delimited list
			if ( 'object' === typeof _selected ) {
				_selected = _selected.join( ',' );
			}

			this.setValue( String( _selected ) );
			this.triggerCallbacks();
		},

		render: function() {

			var self = this,
			    defaults = { multiple: false };

			for ( var arg in defaults ) {
				if ( ! this.model.get( arg ) ) {
					this.model.set( arg, defaults[ arg ] );
				}
			}

			var data = this.model.toJSON();
			data.id = 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid;

			this.$el.html( this.template( data ) );

			var ajaxData = {
				action    : 'shortcode_ui_post_field',
				nonce     : shortcodeUiPostFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			var $field = this.$el.find( '.shortcode-ui-post-select' );

			// Load values to be preselected before initializing field
			var _preselected = String( this.getValue() ).split(',');
			if ( _preselected.length ) {
				$.get( ajaxurl,
					$.extend({ post__in: _preselected }, ajaxData ),
					function( response ) {
						_.each( response.data.posts, function( post ) {
							var _option = $('<option>');
							_option.attr( 'value', post.id )
								.text( post.text )
								.prop( 'selected', 'selected' )
								.appendTo( $field );
						} );
					}
				);
			}

			var $fieldSelect2 = $field.select2({
				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),

				ajax: {
					url: ajaxurl,
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return $.extend( {
							s: params.term, // search term
							page: params.page
						}, ajaxData );
					},
					processResults: function (response, params) {
						if ( ! response.success || 'undefined' === typeof response.data ) {
							return;
						}

						var data = response.data;

						params.page = params.page || 1;

						return {
							results: data.posts,
							pagination: {
								more: ( params.page * data.posts_per_page ) < data.found_posts
							}
						};
					},
					cache: true
				},
				escapeMarkup: function( markup ) { return markup; },
				minimumInputLength: 1,
				templateResult: function( post ) {
					if ( post.loading ) {
						return post.text;
					}

					var markup = '<div class="clearfix select2-result-selectable">' +
						post.text +
					'</div>';

					return markup;
				},
				templateSelection: function( post, container ) {
					return post.text;
				}
			} );

			if ( this.model.get( 'multiple' ) ) {
				var ul = $field.next('.select2-container').first('ul.select2-selection__rendered');
				ul.sortable({
					placeholder : 'ui-state-highlight',
					forcePlaceholderSize: true,
					items       : 'li:not(.select2-search__field)',
					tolerance   : 'pointer',
					stop: function() {
						$( $(ul).find('.select2-selection__choice').get().reverse() ).each(function() {
							var id = $(this).data('data').id;
							var option = $field.find('option[value="' + id + '"]')[0];
							$field.prepend(option);
						});
						$field.trigger( 'change' );
					}
				});
			}

			return this;
		}

	} );

	/**
	 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
	 * changes in Meida modal
	 * 1. going back/forth between different shortcakes (refresh)
	 * 2. changing the menu in left column (deactivate)
	 * 3. @TODO closing the modal.
	 */
	var mediaController = sui.controllers.MediaController;
	sui.controllers.MediaController = mediaController.extend({

		refresh: function(){
			mediaController.prototype.refresh.apply( this, arguments );
			this.destroySelect2UI();
		},

		//doesn't need to call parent as it already an "abstract" method in parent to provide callback
		deactivate: function() {
			this.destroySelect2UI();
		},

		destroySelect2UI: function() {
			$fieldSelect2.select2( 'close' );
		}

	});

} )( jQuery );

},{}],14:[function(require,module,exports){
( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var termSelectCache = {};

	sui.views.editAttributeFieldTermSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-term-select': 'inputChanged',
		},

		inputChanged: function(e) {
			var _selected = $( e.currentTarget ).val();

			// Store multiple selections as comma-delimited list
			if ( 'object' === typeof _selected ) {
				_selected = _selected.join( ',' );
			}

			this.setValue( String( _selected ) );
			this.triggerCallbacks();
		},

		render: function() {

			var self = this,
			    defaults = { multiple: false };

			for ( var arg in defaults ) {
				if ( ! this.model.get( arg ) ) {
					this.model.set( arg, defaults[ arg ] );
				}
			}

			var data = this.model.toJSON();
			data.id = 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid;

			this.$el.html( this.template( data ) );

			var ajaxData = {
				action    : 'shortcode_ui_term_field',
				nonce     : shortcodeUiTermFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			var $field = this.$el.find( '.shortcode-ui-term-select' );

			// Load values to be preselected before initializing field
			var _preselected = String( this.getValue() ).split(',');
			if ( _preselected.length ) {
				$.get( ajaxurl,
					$.extend({ tag__in: _preselected }, ajaxData ),
					function( response ) {
						_.each( response.data.terms, function( term ) {
							var _option = $('<option>');
							_option.attr( 'value', term.id )
								.text( term.text )
								.prop( 'selected', 'selected' )
								.appendTo( $field );
						} );
					}
				);
			}

			var $fieldSelect2 = $field.select2({

				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),

				ajax: {
					url: ajaxurl,
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return $.extend( {
							s: params.term, // search term
							page: params.page
						}, ajaxData );
					},
					processResults: function (response, params) {
						if ( ! response.success || 'undefined' === typeof response.data ) {
							return;
						}

						var data = response.data;

						params.page = params.page || 1;

						return {
							results: data.terms,
							pagination: {
								more: ( params.page * data.terms_per_page ) < data.found_terms
							}
						};
					},
					cache: true
				},
				escapeMarkup: function( markup ) { return markup; },
				minimumInputLength: 1,
				templateResult: function( term ) {
					var markup = '<div class="clearfix select2-result-selectable">' +
						term.text +
					'</div>';

					return markup;
				},
				templateSelection: function( term ) {
					return term.text;
				}

			} );

			if ( this.model.get( 'multiple' ) ) {
				var ul = $field.next('.select2-container').first('ul.select2-selection__rendered');
				ul.sortable({
					placeholder : 'ui-state-highlight',
					forcePlaceholderSize: true,
					items       : 'li:not(.select2-search__field)',
					tolerance   : 'pointer',
					stop: function() {
						$( $(ul).find('.select2-selection__choice').get().reverse() ).each(function() {
							var id = $(this).data('data').id;
							var option = $field.find('option[value="' + id + '"]')[0];
							$field.prepend(option);
						});
						$field.trigger( 'change' );
					}
				});
			}

			return this;
		}

	} );

	/**
	 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
	 * changes in Meida modal
	 * 1. going back/forth between different shortcakes (refresh)
	 * 2. changing the menu in left column (deactivate)
	 * 3. @TODO closing the modal.
	 */
	var mediaController = sui.controllers.MediaController;
	sui.controllers.MediaController = mediaController.extend({

		refresh: function(){
			mediaController.prototype.refresh.apply( this, arguments );
			this.destroySelect2UI();
		},

		//doesn't need to call parent as it already an "abstract" method in parent to provide callback
		deactivate: function() {
			this.destroySelect2UI();
		},

		destroySelect2UI: function() {
			$fieldSelect2.select2( 'close' );
		}

	});

} )( jQuery );

},{}],15:[function(require,module,exports){
( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var userSelectCache = {};

	sui.views.editAttributeFieldUserSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-user-select': 'inputChanged',
		},

		inputChanged: function(e) {
			var _selected = $( e.currentTarget ).val();

			// Store multiple selections as comma-delimited list
			if ( 'object' === typeof _selected ) {
				_selected = _selected.join( ',' );
			}

			this.setValue( String( _selected ) );
			this.triggerCallbacks();
		},

		render: function() {

			var self = this,
			    defaults = { multiple: false };

			for ( var arg in defaults ) {
				if ( ! this.model.get( arg ) ) {
					this.model.set( arg, defaults[ arg ] );
				}
			}

			var data = this.model.toJSON();
			data.id = 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid;

			this.$el.html( this.template( data ) );

			var ajaxData = {
				action    : 'shortcode_ui_user_field',
				nonce     : shortcodeUiUserFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' ),
			};


			var $field = this.$el.find( '.shortcode-ui-user-select' );

			// Load values to be preselected before initializing field
			var _preselected = String( this.getValue() ).split(',');
			if ( _preselected.length ) {
				$.get( ajaxurl,
					$.extend({ include: _preselected }, ajaxData ),
					function( response ) {
						_.each( response.data.users, function( user ) {
							var _option = $('<option>');
							_option.attr( 'value', user.id )
								.text( user.text )
								.prop( 'selected', 'selected' )
								.appendTo( $field );
						} );
					}
				);
			}

			var $fieldSelect2 = $field.select2({
				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return $.extend( {
							s: params.term, // search term
							page: params.page
						}, ajaxData );
					},
					processResults: function (response, params) {
						if ( ! response.success || 'undefined' === typeof response.data ) {
							return;
						}

						var data = response.data;

						params.page = params.page || 1;

						return {
							results: data.users,
							pagination: {
								more: ( params.page * data.users_per_page ) < data.found_users
							}
						};
					},
					cache: true
				},
				escapeMarkup: function( markup ) { return markup; },
				minimumInputLength: 1,
				templateResult: function( user ) {
					if ( user.loading ) {
						return user.text;
					}

					var markup = '<div class="clearfix select2-result-selectable">' +
						user.text +
					'</div>';

					return markup;
				},
				templateSelection: function( user, container ) {
					return user.text;
				}
			});

			if ( this.model.get( 'multiple' ) ) {
				var ul = $field.next('.select2-container').first('ul.select2-selection__rendered');
				ul.sortable({
					placeholder : 'ui-state-highlight',
					forcePlaceholderSize: true,
					items       : 'li:not(.select2-search__field)',
					tolerance   : 'pointer',
					stop: function() {
						$( $(ul).find('.select2-selection__choice').get().reverse() ).each(function() {
							var id = $(this).data('data').id;
							var option = $field.find('option[value="' + id + '"]')[0];
							$field.prepend(option);
						});
						$field.trigger( 'change' );
					}
				});
			}

			return this;
		}

	} );

	/**
	 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
	 * changes in Meida modal
	 * 1. going back/forth between different shortcakes (refresh)
	 * 2. changing the menu in left column (deactivate)
	 * 3. @TODO closing the modal.
	 */
	var mediaController = sui.controllers.MediaController;
	sui.controllers.MediaController = mediaController.extend({

		refresh: function(){
			mediaController.prototype.refresh.apply( this, arguments );
			this.destroySelect2UI();
		},

		//doesn't need to call parent as it already an "abstract" method in parent to provide callback
		deactivate: function() {
			this.destroySelect2UI();
		},

		destroySelect2UI: function() {
			$fieldSelect2.select2( 'close' );
		}

	});

} )( jQuery );

},{}],16:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	sui          = require('./../utils/sui.js'),
	$            = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var editAttributeField = Backbone.View.extend( {

	tagName: "div",

	events: {
		'input  input':                  'inputChanged',
		'input  textarea':               'inputChanged',
		'change select':                 'inputChanged',
		'change input[type="radio"]':    'inputChanged',
		'change input[type="checkbox"]': 'inputChanged'
	},

	render: function() {

		var data = jQuery.extend( {
			id: 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid,
		}, this.model.toJSON() );

		// Convert meta JSON to attribute string.
		var _meta = [];
		for ( var key in data.meta ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.meta[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.meta[ key ] ) {
					_meta.push( _.escape( key ) );
				}

			} else {

				_meta.push( _.escape( key ) + '="' + _.escape( data.meta[ key ] ) + '"' );

			}

		}

		data.meta = _meta.join( ' ' );

		this.$el.html( this.template( data ) );
		this.triggerCallbacks();

		return this;
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model. If a callback function is registered
	 * for this attribute, it should be called as well.
	 */
	inputChanged: function( e ) {

		var $el;

		if ( this.model.get( 'attr' ) ) {
			$el = this.$el.find( '[name="' + this.model.get( 'attr' ) + '"]' );
		} else {
			$el = this.$el.find( '[name="inner_content"]' );
		}

		if ( 'radio' === this.model.attributes.type ) {
			this.setValue( $el.filter(':checked').first().val() );
		} else if ( 'checkbox' === this.model.attributes.type ) {
			this.setValue( $el.is( ':checked' ) );
		}  else if ( 'range' === this.model.attributes.type ) {
			var rangeId =  '#' + e.target.id + '_indicator';
			var rangeValue = e.target.value;
			document.querySelector( rangeId ).value = rangeValue;
			this.setValue( $el.val() );
		} else {
			this.setValue( $el.val() );
		}

		this.triggerCallbacks();
	},

	getValue: function() {
		return this.model.get( 'value' );
	},

	setValue: function( val ) {
		this.model.set( 'value', val );
	},

	triggerCallbacks: function() {

		var shortcodeName = this.shortcode.attributes.shortcode_tag,
			attributeName = this.model.get( 'attr' ),
			hookName      = [ shortcodeName, attributeName ].join( '.' ),
			changed       = this.model.changed,
			collection    = _.flatten( _.values( this.views.parent.views._views ) ),
			shortcode     = this.shortcode;

		/*
		 * Action run when an attribute value changes on a shortcode
		 *
		 * Called as `{shortcodeName}.{attributeName}`.
		 *
		 * @param changed (object)
		 *           The update, ie. { "changed": "newValue" }
		 * @param viewModels (array)
		 *           The collections of views (editAttributeFields)
		 *                         which make up this shortcode UI form
		 * @param shortcode (object)
		 *           Reference to the shortcode model which this attribute belongs to.
		 */
		wp.shortcake.hooks.doAction( hookName, changed, collection, shortcode );

	}

}, {

	/**
	 * Get an attribute field from a shortcode by name.
	 *
	 * Usage: `sui.views.editAttributeField.getField( collection, 'title')`
	 *
	 * @param array collection of editAttributeFields
	 * @param string attribute name
	 * @return editAttributeField The view corresponding to the matching field
	 */
	getField: function( collection, attr ) {
		return _.find( collection,
			function( viewModel ) {
				return attr === viewModel.model.get('attr');
			}
		);
	}
});

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10}],17:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
sui = require('./../utils/sui.js'),
backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	editAttributeField = require('./edit-attribute-field.js'),

	// Additional attribute field types: these fields are all standalone in functionality,
	// but bundled here for simplicity to save an HTTP request.
	editAttributeFieldAttachment = require('./edit-attribute-field-attachment.js'),
	editAttributeFieldPostSelect = require('./edit-attribute-field-post-select.js'),
	editAttributeFieldTermSelect = require('./edit-attribute-field-term-select.js'),
	editAttributeFieldUserSelect = require('./edit-attribute-field-user-select.js'),
	editAttributeFieldColor      = require('./edit-attribute-field-color.js');


/**
 * Single edit shortcode content view.
 */
var EditShortcodeForm = wp.Backbone.View.extend({
	template: wp.template('shortcode-default-edit-form'),

	initialize: function() {

		var t = this;

		var innerContent = this.model.get( 'inner_content' );
		if ( innerContent && typeof innerContent.attributes.type !== 'undefined' ) {

			// add UI for inner_content
			var view = new editAttributeField( { model: innerContent } );

			view.shortcode = t.model;
			view.template = wp.media.template( 'shortcode-ui-content' );

			t.views.add( '.edit-shortcode-form-fields', view );

		}

		this.model.get( 'attrs' ).each( function( attr ) {

			// Get the field settings from localization data.
			var type = attr.get('type');

			if ( ! shortcodeUIFieldData[ type ] ) {
				return;
			}

			var templateData = {
				value: attr.get('value'),
				attr_raw: {
					name: attr.get('value')
				}
			};

			var viewObjName = shortcodeUIFieldData[ type ].view;
			var tmplName    = shortcodeUIFieldData[ type ].template;

			var view       = new sui.views[viewObjName]( { model: attr } );
			view.template  = wp.media.template( tmplName );
			view.shortcode = t.model;

			t.views.add( '.edit-shortcode-form-fields', view );

		} );

		if ( 0 === this.model.get( 'attrs' ).length && ( ! innerContent || typeof innerContent == 'undefined' ) ) {
			var messageView = new Backbone.View({
				tagName:      'div',
				className:    'notice updated',
			});
			messageView.render = function() {
				this.$el.append( '<p>' );
				this.$el.find('p').text( shortcodeUIData.strings.media_frame_no_attributes_message );
				return this;
			};
			t.views.add( '.edit-shortcode-form-fields', messageView );
		}

	},

});

module.exports = EditShortcodeForm;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./edit-attribute-field-attachment.js":11,"./edit-attribute-field-color.js":12,"./edit-attribute-field-post-select.js":13,"./edit-attribute-field-term-select.js":14,"./edit-attribute-field-user-select.js":15,"./edit-attribute-field.js":16}],18:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

/**
 * Single shortcode list item view.
 */
var insertShortcodeListItem = wp.Backbone.View.extend({

	tagName : 'li',
	template : wp.template('add-shortcode-list-item'),
	className : 'shortcode-list-item',

	render : function() {

		var data = this.model.toJSON();
		this.$el.attr('data-shortcode', data.shortcode_tag);

		if (('listItemImage' in data) && 0 === data.listItemImage.indexOf('dashicons-')) {
			var fakeEl = $('<div />').addClass( 'dashicons' ).addClass( data.listItemImage );
			data.listItemImage = $('<div />').append( fakeEl ).html();
		}

		this.$el.html(this.template(data));

		return this;

	}
});

module.exports = insertShortcodeListItem;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],19:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null);
var Shortcodes = require('./../collections/shortcodes.js');
var insertShortcodeListItem = require('./insert-shortcode-list-item.js');

var insertShortcodeList = wp.Backbone.View.extend({

	tagName : 'div',
	template : wp.template('add-shortcode-list'),

	initialize : function( options ) {

		this.displayShortcodes( options );

	},
	
	refresh: function( shortcodeData ) {
		var options;
		if ( shortcodeData instanceof Backbone.Collection ) {
			options = { shortcodes: shortcodeData };
		} else {
			options = { shortcodes: new Shortcodes( shortcodeData ) };
		}
		this.displayShortcodes( options );
	},
	
	displayShortcodes: function(options) {
		var t = this;
		
		t.$el.find('.add-shortcode-list').html('');
		t.options = {};
		t.options.shortcodes = options.shortcodes;

		t.options.shortcodes.each(function(shortcode) {
			t.views.add('ul', new insertShortcodeListItem({
				model : shortcode
			}));
		});
	}

});

module.exports = insertShortcodeList;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../collections/shortcodes.js":2,"./insert-shortcode-list-item.js":18}],20:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null),
	MediaController = require('./../controllers/media-controller.js'),
	Shortcode_UI = require('./shortcode-ui'),
	Toolbar = require('./media-toolbar');

var postMediaFrame = wp.media.view.MediaFrame.Post;
var mediaFrame = postMediaFrame.extend( {

	initialize: function() {

		postMediaFrame.prototype.initialize.apply( this, arguments );

		var id = 'shortcode-ui';

		var opts = {
			id      : id,
			search  : true,
			router  : false,
			toolbar : id + '-toolbar',
			menu    : 'default',
			title   : shortcodeUIData.strings.media_frame_menu_insert_label,
			tabs    : [ 'insert' ],
			priority:  66,
			content : id + '-content-insert',
		};

		if ( 'currentShortcode' in this.options ) {
			opts.title = shortcodeUIData.strings.media_frame_menu_update_label.replace( /%s/, this.options.currentShortcode.attributes.label );
		}

		this.mediaController = new MediaController( opts );

		if ( 'currentShortcode' in this.options ) {
			this.mediaController.props.set( 'currentShortcode', arguments[0].currentShortcode );
			this.mediaController.props.set( 'action', 'update' );
		}

		this.states.add([ this.mediaController ]);

		this.on( 'content:render:' + id + '-content-insert', _.bind( this.contentRender, this, 'shortcode-ui', 'insert' ) );
		this.on( 'toolbar:create:' + id + '-toolbar', this.toolbarCreate, this );
		this.on( 'toolbar:render:' + id + '-toolbar', this.toolbarRender, this );
		this.on( 'menu:render:default', this.renderShortcodeUIMenu );

	},

	events: function() {
		return _.extend( {}, postMediaFrame.prototype.events, {
			'click .media-menu-item'    : 'resetMediaController',
		} );
	},

	resetMediaController: function( event ) {
		if ( this.state() && 'undefined' !== typeof this.state().props && this.state().props.get('currentShortcode') ) {
			this.mediaController.reset();
			this.contentRender( 'shortcode-ui', 'insert' );
		}
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

		toolbar.view = new  Toolbar( {
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
		if ( view.controller.state().props && view.controller.state().props.get( 'currentShortcode' ) ) {
			window.setTimeout( function() {
				view.controller.$el.addClass( 'hide-menu' );
			} );
		}

	},

	insertAction: function() {
		/* Trigger render_destroy */
		/*
		 * Action run before the shortcode overlay is destroyed.
		 *
		 * Called as `shortcode-ui.render_destroy`.
		 *
		 * @param shortcodeModel (object)
		 *           Reference to the shortcode model used in this overlay.
		 */
		var hookName = 'shortcode-ui.render_destroy';
		var shortcodeModel = this.controller.state().props.get( 'currentShortcode' );
		wp.shortcake.hooks.doAction( hookName, shortcodeModel );

		this.controller.state().insert();

	},

} );

module.exports = mediaFrame;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../controllers/media-controller.js":3,"./media-toolbar":21,"./shortcode-ui":23}],21:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);

/**
 * Toolbar view that extends wp.media.view.Toolbar
 * to define cusotm refresh method
 */
var Toolbar = wp.media.view.Toolbar.extend({
	initialize : function() {
		_.defaults(this.options, {
			requires : false
		});
		// Call 'initialize' directly on the parent class.
		wp.media.view.Toolbar.prototype.initialize.apply(this, arguments);
	},

	refresh : function() {
		var action = this.controller.state().props.get('action');
		if( this.get('insert') ) {
			this.get('insert').model.set('disabled', action == 'select');
		}
		/**
		 * call 'refresh' directly on the parent class
		 */
		wp.media.view.Toolbar.prototype.refresh.apply(this, arguments);
	}
});

module.exports = Toolbar;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
(function (global){
var wp = (typeof window !== "undefined" ? window['wp'] : typeof global !== "undefined" ? global['wp'] : null);
sui = require('./../utils/sui.js');

var SearchShortcode = wp.media.view.Search.extend({
	tagName:   'input',
	className: 'search',
	id:        'media-search-input',
	
	initialize: function( options ) {
		this.shortcodeList = options.shortcodeList;
	}, 

	attributes: {
		type:        'search',
		placeholder: shortcodeUIData.strings.search_placeholder
	},

	events: {
		'keyup':  'search',
	},

	/**
	 * @returns {wp.media.view.Search} Returns itself to allow chaining
	 */
	render: function() {
		this.el.value = this.model.escape('search');
		return this;
	},
	
	refreshShortcodes: function( shortcodeData ) {
		this.shortcodeList.refresh( shortcodeData );
	},

	search: function( event ) {
		if ( '' === event.target.value ) {
			this.refreshShortcodes( sui.shortcodes );
		} else {
			this.refreshShortcodes( this.controller.search( event.target.value ) );
		}
	}
});

sui.views.SearchShortcode = SearchShortcode;
module.exports = SearchShortcode;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10}],23:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window['Backbone'] : typeof global !== "undefined" ? global['Backbone'] : null),
	insertShortcodeList = require('./insert-shortcode-list.js'),
	EditShortcodeForm = require('./edit-shortcode-form.js'),
	Toolbar = require('./media-toolbar.js'),
	SearchShortcode = require('./search-shortcode.js'),
	sui = require('./../utils/sui.js'),
	$ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);

var Shortcode_UI = Backbone.View.extend({

	events: {
		"click .add-shortcode-list li":      "select",
		"click .edit-shortcode-form-cancel": "cancelSelect"
	},

	initialize: function(options) {
		this.controller = options.controller.state();
		//toolbar model looks for controller.state()
		this.toolbar_controller = options.controller;
	},

	createToolbar: function(options) {
		toolbarOptions = {
			controller: this.toolbar_controller
		};

		this.toolbar = new Toolbar( toolbarOptions );

		this.views.add( this.toolbar );

		this.toolbar.set( 'search', new SearchShortcode({
			controller:    this.controller,
			model:         this.controller.props,
			shortcodeList: this.shortcodeList,
			priority:   60
		}).render() );

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
		this.shortcodeList = new insertShortcodeList( { shortcodes: sui.shortcodes } );
		this.createToolbar();
		this.views.add('', this.shortcodeList);
	},

	renderEditShortcodeView: function() {
		var shortcode = this.controller.props.get( 'currentShortcode' );
		var view = new EditShortcodeForm({ model: shortcode });
		this.$el.append( view.render().el );

		if ( this.controller.props.get('action') === 'update' ) {
			this.$el.find( '.edit-shortcode-form-cancel' ).remove();
		}

		return this;

	},

	cancelSelect: function( e ) {
		e.preventDefault();

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

		/* Trigger render_new */
		/*
		 * Action run after a new shortcode overlay is rendered.
		 *
		 * Called as `shortcode-ui.render_new`.
		 *
		 * @param shortcodeModel (object)
		 *           Reference to the shortcode model used in this overlay.
		 */
		var hookName = 'shortcode-ui.render_new';
		var shortcodeModel = this.controller.props.get( 'currentShortcode' );
		wp.shortcake.hooks.doAction( hookName, shortcodeModel );

	},

});

module.exports = Shortcode_UI;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../utils/sui.js":10,"./edit-shortcode-form.js":17,"./insert-shortcode-list.js":19,"./media-toolbar.js":21,"./search-shortcode.js":22}]},{},[7]);
