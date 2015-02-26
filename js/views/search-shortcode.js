var wp = require('wp');
sui = require('sui-utils/sui');

var SearchShortcode = wp.media.view.Search.extend({
	tagName:   'input',
	className: 'search',
	id:        'media-search-input',

	attributes: {
		type:        'search',
		placeholder: 'search'
	},

	events: {
		'input':  'search',
		'keyup':  'search',
		'change': 'search',
		'search': 'search'
	},

	/**
	 * @returns {wp.media.view.Search} Returns itself to allow chaining
	 */
	render: function() {
		this.el.value = this.model.escape('search');
		return this;
	},

	search: function( event ) {
		console.log( 'I am searching' );
//		if ( event.target.value ) {
//			this.model.set( 'search', event.target.value );
//		} else {
//			this.model.unset('search');
//		}
	}
});

sui.views.SearchShortcode = SearchShortcode;
module.exports = SearchShortcode;