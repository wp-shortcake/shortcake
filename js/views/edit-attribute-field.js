var Backbone = require('backbone'),
sui = require('sui-utils/sui'),
$ = require('jquery');

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

		// Convert attribute JSON to attribute string.
		var _attributes = [];
		for ( var key in data.customAttributes ) {

			// Boolean attributes can only require attribute key, not value.
			if ( 'boolean' === typeof( data.customAttributes[ key ] ) ) {

				// Only set truthy boolean attributes.
				if ( data.customAttributes[ key ] ) {
					_attributes.push( _.escape( key ) );
				}

			} else {

				_attributes.push( _.escape( key ) + '="' + _.escape( data.customAttributes[ key ] ) + '"' );

			}

		}

		data.customAttributes = _attributes.join( ' ' );

		this.$el.html( this.template( data ) );

		return this
	},

	/**
	 * Input Changed Update Callback.
	 *
	 * If the input field that has changed is for content or a valid attribute,
	 * then it should update the model.
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
	},

} );

sui.views.editAttributeField = editAttributeField;
module.exports = editAttributeField;
