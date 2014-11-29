define( ['shortcodes/attribute.model'], function( ShortcodeAttribute ) {
    'use strict';

	/**
	 * @was sui.models.ShortcodeAttributes
	 */
	var ShortcodeAttributes = Backbone.Collection.extend({
		model: ShortcodeAttribute,
		//  Deep Clone.
		clone: function() {
			return new this.constructor( _.map( this.models, function(m) {
				return m.clone();
			} ) );
		}
	});

	return ShortcodeAttributes;
});