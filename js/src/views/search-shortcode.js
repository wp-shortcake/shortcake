var wp = require('wp');
sui = require('sui-utils/sui');

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
