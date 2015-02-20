var Backbone = require('backbone');

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
		if ( 'checkbox' === this.model.attributes.type ) {
			this.model.set( 'value', $el.is( ':checked' ) );
		} else {
			this.model.set( 'value', $el.val() );
		}
	},

} );

module.exports = EditAttributeField;