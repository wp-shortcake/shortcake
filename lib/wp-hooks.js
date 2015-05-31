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
