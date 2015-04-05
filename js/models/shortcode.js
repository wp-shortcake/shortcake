var Backbone = require('backbone');
var ShortcodeAttributes = require('sui-collections/shortcode-attributes');
var InnerContent = require('sui-models/inner-content');
sui = require('sui-utils/sui');

Shortcode = Backbone.Model.extend({

	defaults: {
		label: '',
		shortcode_tag: '',
		attrs: sui.models.ShortcodeAttributes,
		inner_content: sui.models.InnerContent,
	},

	/**
	 * Custom set method.
	 * Handles setting the attribute collection.
	 */
	set: function( attributes, options ) {

		if ( attributes.attrs !== undefined && ! ( attributes.attrs instanceof ShortcodeAttributes ) ) {
			attributes.attrs = new ShortcodeAttributes( attributes.attrs );
		}
		
		if ( attributes.inner_content !== undefined && ! ( attributes.inner_content instanceof InnerContent ) ) {
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
		if ( options.attrs !== undefined && ( options.attrs instanceof ShortcodeAttributes ) ) {
			options.attrs = options.attrs.toJSON();
		}
		if ( options.inner_content !== undefined && ( options.inner_content instanceof InnerContent ) ) {
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
		clone.set( 'inner_content', clone.get( 'inner_content' ).clone() );
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

			// Handle content attribute as a special case.
			if ( attr.get( 'attr' ) === 'content' ) {
				content = attr.get( 'value' );
			} else {
				
				// Numeric/unnamed attributes
				if ( ! isNaN( attr.get( 'attr' ) ) ) {
					
					// Empty attributes are false to preserve attribute keys
					attrs.push( typeof attr.get( 'value' ) === 'undefined' || attr.get( 'value' ).trim() === '' ? 'false' : attr.get( 'value' ) );
					
				// String attribute names
				} else {
					
					// Skip empty attributes.
					if ( ! attr.get( 'value' ) ||  attr.get( 'value' ).length < 1 ) {
						return;
					}
			
					attrs.push( attr.get( 'attr' ) + '="' + attr.get( 'value' ) + '"' );
				}
			}

		} );

		if ( 'undefined' !== typeof this.get( 'inner_content' ).get( 'value' ) && this.get( 'inner_content' ).get( 'value').length > 0 ) {
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

sui.models.Shortcode = Shortcode;
module.exports = Shortcode;
