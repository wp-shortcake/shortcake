var wp = require('wp'),
	sui = require('sui-utils/sui'),
	backbone = require('backbone'),
	EditAttributeField = require( 'sui-views/edit-attribute-field' ),
	EditShortcodeForm = require( 'sui-views/edit-shortcode-form' ),
	$ = require( 'jquery' );

/**
 * Single edit shortcode content view.
 */
var EditShortcodeFormTest = EditShortcodeForm.extend({

	template: wp.template( 'shortcode-ui-test-inline-edit' ),

	events: {
		'keyup  input[type="text"]':   'inputChanged',
		'keyup  textarea':             'inputChanged',
		'keyup  [contenteditable]':    'inputChanged',
		'change select':               'inputChanged',
		'change input[type=checkbox]': 'inputChanged',
		'change input[type=radio]':    'inputChanged',
		'change input[type=email]':    'inputChanged',
		'change input[type=number]':   'inputChanged',
		'change input[type=date]':     'inputChanged',
		'change input[type=url]':      'inputChanged',
	},

	initialize: function() {},

	render: function() {
		console.log( this.model.toJSON() );

		this.$el.html( this.template( this.model.toJSON() ) );
		return this;
	},

	inputChanged: _.debounce( function(e) {

		var val, attr, targetAttr;

		attr = e.target.getAttribute( 'name' );

        if ( e.target.hasAttribute( 'contenteditable' ) ) {
        	val = $(e.target).html();
        } else {
        	val = e.target.value;
        }

        if ( 'content' === attr ) {
        	targetAttr = this.model.get( 'inner_content' );
        } else {
        	targetAttr = this.model.get( 'attrs' ).findWhere( { attr: attr } );
	    }

	    if ( targetAttr ) {
	      	targetAttr.set( 'value', val );
	      	this.model.trigger('change');
	      	this.model.trigger('changed');
        }


	}, 250 ),

});

module.exports = EditShortcodeFormTest;
