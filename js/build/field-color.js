(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
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
	}
});

module.exports = ShortcodeAttributes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode-attribute.js":5}],2:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var Shortcode = require('./../models/shortcode.js');

// Shortcode Collection
var Shortcodes = Backbone.Collection.extend({
	model : Shortcode
});

module.exports = Shortcodes;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./../models/shortcode.js":6}],3:[function(require,module,exports){
(function (global){
var sui = require('./utils/sui.js'),
    editAttributeField = require('./views/edit-attribute-field.js'),
    $ = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null);

sui.views.editAttributeFieldColor = editAttributeField.extend( {

	render: function() {
		this.$el.html( this.template( this.model.toJSON() ) );

		this.$el.find('input[type="text"]:not(.wp-color-picker)').wpColorPicker({
			change: function() {
				$(this).trigger('keyup');
			}
		});

		return this;
	}

} );

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils/sui.js":7,"./views/edit-attribute-field.js":8}],4:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

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
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);

var ShortcodeAttribute = Backbone.Model.extend({
	defaults: {
		attr:        '',
		label:       '',
		type:        '',
		value:       '',
		description: '',
		meta: {
			placeholder: '',
		},
		callback:    '',
	},
});

module.exports = ShortcodeAttribute;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],6:[function(require,module,exports){
(function (global){
var Backbone = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null);
var ShortcodeAttributes = require('./../collections/shortcode-attributes.js');
var InnerContent = require('./inner-content.js');

Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: new ShortcodeAttributes,
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

			attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );

		} );

		if ( this.get( 'inner_content' ) ) {
			content = this.get( 'inner_content' ).get( 'value' );
		}

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
},{"./../collections/shortcode-attributes.js":1,"./inner-content.js":4}],7:[function(require,module,exports){
var Shortcodes = require('./../collections/shortcodes.js');

window.Shortcode_UI = window.Shortcode_UI || {
	shortcodes: new Shortcodes,
	views: {},
	controllers: {},
};

module.exports = window.Shortcode_UI;

},{"./../collections/shortcodes.js":2}],8:[function(require,module,exports){
(function (global){
var Backbone     = (typeof window !== "undefined" ? window.Backbone : typeof global !== "undefined" ? global.Backbone : null),
	sui          = require('./../utils/sui.js'),
	$            = (typeof window !== "undefined" ? window.jQuery : typeof global !== "undefined" ? global.jQuery : null),
	EventManager = require('../../../lib/wp-hooks');

var editAttributeField = Backbone.View.extend( {

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
		this.updateValue();

		return this
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model. If a callback function is registered
	 * for this attribute, it should be called as well.
	 */
	updateValue: function( e ) {

		if ( this.model.get( 'attr' ) ) {
			var $el = $( this.el ).find( '[name=' + this.model.get( 'attr' ) + ']' );
		} else {
			var $el = $( this.el ).find( '[name="inner_content"]' );
		}

		if ( 'radio' === this.model.attributes.type ) {
			this.model.set( 'value', $el.filter(':checked').first().val() );
		} else if ( 'checkbox' === this.model.attributes.type ) {
			this.model.set( 'value', $el.is( ':checked' ) );
		} else {
			this.model.set( 'value', $el.val() );
		}

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
		wp.shortcodeUi.hooks.doAction( hookName, changed, collection, shortcode );

	}

} );

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../lib/wp-hooks":9,"./../utils/sui.js":7}],9:[function(require,module,exports){
window.wp = window.wp || {};
window.wp.shortcodeUi = window.wp.shortcodeUi || {};

/**
 * This is a basic event manager based on the one proposed for WordPress core
 * in https://core.trac.wordpress.org/attachment/ticket/21170.
 *
 * It is namespaced to `.wp.shortcodeUi.hooks` to avoid collisions with the
 * proposed system of hooks for core, if they are adopted at `wp.hooks`.
 * However, we plan to  keep basic feature parity and interoperability with the
 * proposed JS hooks and filters system for core, with the end goal of using
 * the same API as what is finally decided on there.
 *
 */
(function(namespace) {
	"use strict";

	/**
	 * Handles managing all events for whatever you plug it into. Priorities for
	 * hooks are based on lowest to highest in that, lowest priority hooks are
	 * fired first.
	 */
	var EventManager = function() {
		/**
		 * Maintain a reference to the object scope so our public methods never
		 * get confusing.
		 */
		var MethodsAvailable = {
			removeFilter : removeFilter,
			applyFilters : applyFilters,
			addFilter : addFilter,
			removeAction : removeAction,
			doAction : doAction,
			addAction : addAction
		};

		/**
		 * Contains the hooks that get registered with this EventManager. The
		 * array for storage utilizes a "flat" object literal such that looking
		 * up the hook utilizes the native object literal hash.
		 */
		var STORAGE = {
			actions : {},
			filters : {}
		};

		/**
		 * Adds an action to the event manager.
		 *
		 * @param action
		 *            Must contain namespace.identifier
		 * @param callback
		 *            Must be a valid callback function before this action is
		 *            added
		 * @param [priority=10]
		 *            Used to control when the function is executed in relation
		 *            to other callbacks bound to the same hook
		 * @param [context]
		 *            Supply a value to be used for this
		 */
		function addAction(action, callback, priority, context) {
			console.log( action, callback );
			if (typeof action === 'string' && typeof callback === 'function') {
				priority = parseInt((priority || 10), 10);
				_addHook('actions', action, callback, priority, context);
			}

			return MethodsAvailable;
		}

		/**
		 * Performs an action if it exists. You can pass as many arguments as
		 * you want to this function; the only rule is that the first argument
		 * must always be the action.
		 */
		function doAction( /* action, arg1, arg2, ... */) {
			var args = Array.prototype.slice.call(arguments);
			var action = args.shift();

			if (typeof action === 'string') {
				_runHook('actions', action, args);
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified action if it contains a namespace.identifier &
		 * exists.
		 *
		 * @param action
		 *            The action to remove
		 * @param [callback]
		 *            Callback function to remove
		 */
		function removeAction(action, callback) {
			if (typeof action === 'string') {
				_removeHook('actions', action, callback);
			}

			return MethodsAvailable;
		}

		/**
		 * Adds a filter to the event manager.
		 *
		 * @param filter
		 *            Must contain namespace.identifier
		 * @param callback
		 *            Must be a valid callback function before this action is
		 *            added
		 * @param [priority=10]
		 *            Used to control when the function is executed in relation
		 *            to other callbacks bound to the same hook
		 * @param [context]
		 *            Supply a value to be used for this
		 */
		function addFilter(filter, callback, priority, context) {
			if (typeof filter === 'string' && typeof callback === 'function') {
				priority = parseInt((priority || 10), 10);
				_addHook('filters', filter, callback, priority);
			}

			return MethodsAvailable;
		}

		/**
		 * Performs a filter if it exists. You should only ever pass 1 argument
		 * to be filtered. The only rule is that the first argument must always
		 * be the filter.
		 */
		function applyFilters( /* filter, filtered arg, arg2, ... */) {
			var args = Array.prototype.slice.call(arguments);
			var filter = args.shift();

			if (typeof filter === 'string') {
				return _runHook('filters', filter, args);
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified filter if it contains a namespace.identifier &
		 * exists.
		 *
		 * @param filter
		 *            The action to remove
		 * @param [callback]
		 *            Callback function to remove
		 */
		function removeFilter(filter, callback) {
			if (typeof filter === 'string') {
				_removeHook('filters', filter, callback);
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified hook by resetting the value of it.
		 *
		 * @param type
		 *            Type of hook, either 'actions' or 'filters'
		 * @param hook
		 *            The hook (namespace.identifier) to remove
		 * @private
		 */
		function _removeHook(type, hook, callback) {
			var actions, action, index;
			if (STORAGE[type][hook]) {
				if (typeof callback === 'undefined') {
					STORAGE[type][hook] = [];
				} else {
					actions = STORAGE[type][hook];
					for (index = 0; index < actions.length; index++) {
						action = actions[index];
						if (action.callback === callback) {
							STORAGE[type][hook].splice(index, 1);
						}
					}
				}
			}
		}

		/**
		 * Adds the hook to the appropriate storage container
		 *
		 * @param type
		 *            'actions' or 'filters'
		 * @param hook
		 *            The hook (namespace.identifier) to add to our event
		 *            manager
		 * @param callback
		 *            The function that will be called when the hook is
		 *            executed.
		 * @param priority
		 *            The priority of this hook. Must be an integer.
		 * @param [context]
		 *            A value to be used for this
		 * @private
		 */
		function _addHook(type, hook, callback, priority, context) {
			var hookObject = {
				callback : callback,
				priority : priority,
				context : context
			};

			// Utilize 'prop itself' :
			// http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
			var hooks = STORAGE[type][hook];
			if (hooks) {
				hooks.push(hookObject);
				hooks = _hookInsertSort(hooks);
			} else {
				hooks = [ hookObject ];
			}

			STORAGE[type][hook] = hooks;
		}

		/**
		 * Use an insert sort for keeping our hooks organized based on priority.
		 * This function is ridiculously faster than bubble sort, etc:
		 * http://jsperf.com/javascript-sort
		 *
		 * @param hooks
		 *            The custom array containing all of the appropriate hooks
		 *            to perform an insert sort on.
		 * @private
		 */
		function _hookInsertSort(hooks) {
			var tmpHook, j, prevHook;
			for ( var i = 1, len = hooks.length; i < len; i++) {
				tmpHook = hooks[i];
				j = i;
				while ((prevHook = hooks[j - 1])
						&& prevHook.priority > tmpHook.priority) {
					hooks[j] = hooks[j - 1];
					--j;
				}
				hooks[j] = tmpHook;
			}

			return hooks;
		}

		/**
		 * Runs the specified hook. If it is an action, the value is not
		 * modified but if it is a filter, it is.
		 *
		 * @param type
		 *            'actions' or 'filters'
		 * @param hook
		 *            The hook ( namespace.identifier ) to be ran.
		 * @param args
		 *            Arguments to pass to the action/filter. If it's a filter,
		 *            args is actually a single parameter.
		 * @private
		 */
		function _runHook(type, hook, args) {
			var hooks = STORAGE[type][hook];
			if (typeof hooks === 'undefined') {
				if (type === 'filters') {
					return args[0];
				}
				return false;
			}

			for ( var i = 0, len = hooks.length; i < len; i++) {
				if (type === 'actions') {
					hooks[i].callback.apply(hooks[i].context, args);
				} else {
					args[0] = hooks[i].callback.apply(hooks[i].context, args);
				}
			}

			if (type === 'actions') {
				return true;
			}

			return args[0];
		}

		// return all of the publicly available methods
		return MethodsAvailable;

	};
	namespace = namespace || {};
	namespace.hooks = new EventManager();

})(window.wp.shortcodeUi);

},{}]},{},[3]);
