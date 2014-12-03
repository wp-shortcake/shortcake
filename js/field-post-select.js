( function( $ ) {

	var sui = window.Shortcode_UI;

	sui.views.editAttributeFieldPostSelect2 = sui.views.editAttributeField.extend( {

		render: function() {

			this.$el.html( this.template( this.model.toJSON() ) );

			var multiple = false;

			var ajaxData = {
				action    : 'shortcode_ui_post_field',
				nonce     : shortcodeUIPostFieldData[ this.shortcode.get( 'shortcode_tag') ][ this.model.get( 'attr' ) ].nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			this.$el.find( '.shortcode-ui-post-select' ).select2({
				placeholder: "Search",
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					quietMillis: 250,
					data: function (term, page) {
						ajaxData.s    = term,
						ajaxData.page = page;
						return ajaxData;
					},
					results: function ( response, page ) {

						if ( ! response.success ) {
							return { results: {}, more: false };
						}

						var more = ( page * response.data.posts_per_page ) < response.data.found_posts; // whether or not there are more results available
						return { results: response.data.posts, more: more };

					},
				},

				/**
				 * Initialize Callback
				 * Used to set render the initial value.
				 * Has to make a request to get the title for the current ID.
				 */
				initSelection: function(element, callback) {

					var val = $(element).val();

					if ( val !== "" ) {

						var initAjaxData = jQuery.extend( true, {}, ajaxData );
						initAjaxData.action = 'shortcode_ui_post_field_init_values';
						initAjaxData.value = val;

						$.get( ajaxurl, initAjaxData ).done( function( response ) {

							// If not multi select - passing an array doesn't work.
							if ( ! multiple ) {
								response.data.posts = response.data.posts[0];
							}

							callback( response.data.posts );

						} );

					}
				},
			} );

			return this;

		}

	} );

} )( jQuery );
