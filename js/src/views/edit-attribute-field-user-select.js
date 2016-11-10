( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var userSelectCache = {};

	sui.views.editAttributeFieldUserSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-user-select': 'inputChanged',
		},

		inputChanged: function(e) {
			var _selected = $( e.currentTarget ).val();

			// Store multiple selections as comma-delimited list
			if ( 'object' === typeof _selected ) {
				_selected = _selected.join( ',' );
			}

			this.setValue( String( _selected ) );
			this.triggerCallbacks();
		},

		render: function() {

			var self = this,
			    defaults = { multiple: false };

			for ( var arg in defaults ) {
				if ( ! this.model.get( arg ) ) {
					this.model.set( arg, defaults[ arg ] );
				}
			}

			var data = this.model.toJSON();
			data.id = 'shortcode-ui-' + this.model.get( 'attr' ) + '-' + this.model.cid;

			this.$el.html( this.template( data ) );

			var ajaxData = {
				action    : 'shortcode_ui_user_field',
				nonce     : shortcodeUiUserFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' ),
			};


			var $field = this.$el.find( '.shortcode-ui-user-select' );

			// Load values to be preselected before initializing field
			var _preselected = String( this.getValue() ).split(',');
			if ( _preselected.length ) {
				$.get( ajaxurl,
					$.extend({ include: _preselected }, ajaxData ),
					function( response ) {
						_.each( response.data.users, function( user ) {
							var _option = $('<option>');
							_option.attr( 'value', user.id )
								.text( user.text )
								.prop( 'selected', 'selected' )
								.appendTo( $field );
						} );
					}
				);
			}

			var $fieldSelect2 = $field.select2({
				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					delay: 250,
					data: function (params) {
						return $.extend( {
							s: params.term, // search term
							page: params.page
						}, ajaxData );
					},
					processResults: function (response, params) {
						if ( ! response.success || 'undefined' === typeof response.data ) {
							return;
						}

						var data = response.data;

						params.page = params.page || 1;

						return {
							results: data.users,
							pagination: {
								more: ( params.page * data.users_per_page ) < data.found_users
							}
						};
					},
					cache: true
				},
				escapeMarkup: function( markup ) { return markup; },
				minimumInputLength: 1,
				templateResult: function( user ) {
					if ( user.loading ) {
						return user.text;
					}

					var markup = '<div class="clearfix select2-result-selectable">' +
						user.text +
					'</div>';

					return markup;
				},
				templateSelection: function( user, container ) {
					return user.text;
				}
			});

			if ( this.model.get( 'multiple' ) ) {
				var ul = $field.next('.select2-container').first('ul.select2-selection__rendered');
				ul.sortable({
					placeholder : 'ui-state-highlight',
					forcePlaceholderSize: true,
					items       : 'li:not(.select2-search__field)',
					tolerance   : 'pointer',
					stop: function() {
						$( $(ul).find('.select2-selection__choice').get().reverse() ).each(function() {
							var id = $(this).data('data').id;
							var option = $field.find('option[value="' + id + '"]')[0];
							$field.prepend(option);
						});
						$field.trigger( 'change' );
					}
				});
			}

			return this;
		}

	} );

	/**
	 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
	 * changes in Meida modal
	 * 1. going back/forth between different shortcakes (refresh)
	 * 2. changing the menu in left column (deactivate)
	 * 3. @TODO closing the modal.
	 */
	var mediaController = sui.controllers.MediaController;
	sui.controllers.MediaController = mediaController.extend({

		refresh: function(){
			mediaController.prototype.refresh.apply( this, arguments );
			this.destroySelect2UI();
		},

		//doesn't need to call parent as it already an "abstract" method in parent to provide callback
		deactivate: function() {
			this.destroySelect2UI();
		},

		destroySelect2UI: function() {
			$fieldSelect2.select2( 'close' );
		}

	});

} )( jQuery );
