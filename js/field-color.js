var sui = require('sui-utils/sui'),
    editAttributeField = require( 'sui-views/edit-attribute-field' ),
    $ = require('jquery');

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
