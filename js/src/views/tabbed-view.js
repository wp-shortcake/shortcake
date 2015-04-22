var Backbone = require('backbone');
var sui = require('sui-utils/sui');
var $ = require('jquery');

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

sui.views.TabbedView = TabbedView;
module.exports = TabbedView;
