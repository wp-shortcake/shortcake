( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var termSelectCache = {};

	sui.views.editAttributeFieldTermSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-term-select': 'inputChanged',
		},

		inputChanged: function(e) {
			this.setValue( e.val );
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
				action    : 'shortcode_ui_term_field',
				nonce     : shortcodeUiTermFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			var $field = this.$el.find( '.shortcode-ui-term-select' );

			$field.select2({

				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					quietMillis: 250,
					data: function (term, page) {
						ajaxData.s = term;
						ajaxData.page = page;
						return ajaxData;
					},
					results: function ( response,  page ) {

						if ( ! response.success ) {
							return { results: {}, more: false };
						}

						// Cache data for quicker rendering later.
						termSelectCache = $.extend( termSelectCache, response.data.terms );
						
						var more = ( page * response.data.page ) < response.data.found_terms; // whether or not there are more results available

						return { results: response.data.terms, more: more };

					},
				},

				/**
				 * Initialize Callback
				 * Used to set render the initial value.
				 * Has to make a request to get the title for the current ID.
				 */
				initSelection: function(element, callback) {

					var term_ids, parsedData = [], cached;

					// Convert stored value to array of IDs (int).
					term_ids = $(element)
						.val()
						.split(',')
						.map( function (str) { return str.trim(); } )
						.map( function (str) { return parseInt( str ); } );

					if ( term_ids.length < 1 ) {
						return;
					}

					// Check if there is already cached data.
					for ( var i = 0; i < term_ids.length; i++ ) {
						cached = _.find( termSelectCache, _.matches( { term_id: term_ids[i] } ) );
						if ( cached ) {
							parsedData.push( cached );
						}
					}

					// If not multiple - return single value if we have one.
					if ( parsedData.length && ! self.model.get( 'multiple' ) ) {
						callback( parsedData[0] );
						return;
					}

					var uncachedIds = _.difference( term_ids, _.pluck( parsedData, 'term_id' ) );

					if ( ! uncachedIds.length ) {

						callback( parsedData );

					} else {

						var initAjaxData      = jQuery.extend( true, {}, ajaxData );
						initAjaxData.action   = 'shortcode_ui_term_field';
						initAjaxData.post__in = uncachedIds;

						$.get( ajaxurl, initAjaxData ).done( function( response ) {

							if ( ! response.success ) {
								return { results: {}, more: false };
							}

							termSelectCache = $.extend( termSelectCache, response.data.terms );

							// If not multi-select, expects single object, not array of objects.
							if ( ! self.model.get( 'multiple' ) ) {
								callback( response.data.terms[0] );
								return;
							}

							// Append new data to cached data.
							// Sort by original order.
							parsedData = parsedData
								.concat( response.data.terms )
								.sort(function (a, b) {
									if ( term_ids.indexOf( a.term_id ) > term_ids.indexOf( b.term_id ) ) return 1;
									if ( term_ids.indexOf( a.term_id ) < term_ids.indexOf( b.term_id ) ) return -1;
									return 0;
								});

							callback( parsedData );
							return;

						} );

					}

				},

			} );

			// Make multiple values sortable.
			if ( this.model.get( 'multiple' ) ) {
				$field.select2('container').find('ul.select2-choices').sortable({
	    			containment: 'parent',
	    			start: function() { $('.shortcode-ui-term-select').select2('onSortStart'); },
	    			update: function() { $('.shortcode-ui-term-select').select2('onSortEnd'); }
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
			$('.shortcode-ui-term-select.select2-container').select2( "close" );
		}

	});

} )( jQuery );
