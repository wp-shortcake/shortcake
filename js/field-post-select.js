( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var postSelectCache = {};

	sui.views.editAttributeFieldPostSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcake-post-select': 'updateValue',
		},

		render: function() {

			this.$el.html( this.template( this.model.toJSON() ) );

			var multiple = false;

			var ajaxData = {
				action    : 'shortcake_post_field',
				nonce     : shortcakePostFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			this.$el.find( '.shortcake-post-select' ).select2({

				placeholder: "Search",
				ajax: {
					url: ajaxurl,
					dataType: 'json',
					quietMillis: 250,
					data: function (term, page) {
						ajaxData.s    = term;
						ajaxData.page = page;
						return ajaxData;
					},
					results: function ( response, page ) {

						if ( ! response.success ) {
							return { results: {}, more: false };
						}

						postSelectCache = $.extend( postSelectCache, response.data.posts );

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

					var val, cached;

					val = parseInt( $(element).val() );

					if ( ! val ) {
						return;
					}

					if ( cached = _.find( postSelectCache, _.matches( { id: val } )) ) {

						callback( cached );

					} else {

						var initAjaxData      = jQuery.extend( true, {}, ajaxData );
						initAjaxData.action   = 'shortcake_post_field';
						initAjaxData.post__in = val;

						$.get( ajaxurl, initAjaxData ).done( function( response ) {

							if ( ! response.success ) {
								return { results: {}, more: false };
							}

							postSelectCache = $.extend( postSelectCache, response.data.posts );

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

	/**
	 * Extending SUI Media Controller to hide Select2 UI Drop-Down when menu
	 * changes in Meida modal
	 * 1. going back/forth between different shortcakes (refresh)
	 * 2. changing the menu in left column (deactivate)
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
			if( $(".shortcake-post-select").hasClass('.select2-container') ) {
				$(".shortcake-post-select").select2( "destroy" );
			}
		}
	});

	// /**
	//  * Extending the SUI Tabbed View to hide Select2 UI dropdown when previewing the shortcake
	//  */
	var tabbedView = sui.views.TabbedView;
	sui.views.TabbedView = tabbedView.extend({
		tabSwitcher: function() {

			tabbedView.prototype.tabSwitcher.apply( this, arguments );

			if ( $(".shortcake-post-select").hasClass('.select2-container') ) {
				$(".shortcake-post-select").select2( "destroy" );
			}
		}
	});

} )( jQuery );
