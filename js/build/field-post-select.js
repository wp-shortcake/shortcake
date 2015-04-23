(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
( function( $ ) {

	var sui = window.Shortcode_UI;

	// Cached Data.
	var postSelectCache = {};

	sui.views.editAttributeFieldPostSelect = sui.views.editAttributeField.extend( {

		events: {
			'change .shortcode-ui-post-select': 'updateValue',
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
				action    : 'shortcode_ui_post_field',
				nonce     : shortcodeUiPostFieldData.nonce,
				shortcode : this.shortcode.get( 'shortcode_tag'),
				attr      : this.model.get( 'attr' )
			};

			var $field = this.$el.find( '.shortcode-ui-post-select' );

			$field.select2({

				placeholder: "Search",
				multiple: this.model.get( 'multiple' ),
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

						// Cache data for quicker rendering later.
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

					var ids, parsedData = [], cached;

					// Convert stored value to array of IDs (int).
					ids = $(element)
						.val()
						.split(',')
						.map( function (str) { return str.trim(); } )
						.map( function (str) { return parseInt( str ); } )

					if ( ids.length < 1 ) {
						return;
					}

					// Check if there is already cached data.
					for ( var i = 0; i < ids.length; i++ ) {
						if ( cached = _.find( postSelectCache, _.matches( { id: ids[i] } ) ) ) {
							parsedData.push( cached );
						}
					};

					// If not multiple - return single value if we have one.
					if ( parsedData.length && ! self.model.get( 'multiple' ) ) {
						callback( parsedData[0] );
						return;
					}

					var uncachedIds = _.difference( ids, _.pluck( parsedData, 'id' ) );

					if ( ! uncachedIds.length ) {

						callback( parsedData );

					} else {

						var initAjaxData      = jQuery.extend( true, {}, ajaxData );
						initAjaxData.action   = 'shortcode_ui_post_field';
						initAjaxData.post__in = uncachedIds;

						$.get( ajaxurl, initAjaxData ).done( function( response ) {

							if ( ! response.success ) {
								return { results: {}, more: false };
							}

							postSelectCache = $.extend( postSelectCache, response.data.posts );

							// If not multi-select, expects single object, not array of objects.
							if ( ! self.model.get( 'multiple' ) ) {
								callback( response.data.posts[0] );
								return;
							}

							// Append new data to cached data.
							// Sort by original order.
							parsedData = parsedData
								.concat( response.data.posts )
								.sort(function (a, b) {
									if ( ids.indexOf( a.id ) > ids.indexOf( b.id ) ) return 1;
									if ( ids.indexOf( a.id ) < ids.indexOf( b.id ) ) return -1;
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
	    			start: function() { $('.shortcode-ui-post-select').select2('onSortStart'); },
	    			update: function() { $('.shortcode-ui-post-select').select2('onSortEnd'); }
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
			$('.shortcode-ui-post-select.select2-container').select2( "close" );
		}

	});

	/**
	 * Extending the SUI Tabbed View to hide Select2 UI dropdown when previewing the shortcake
	 */
	var tabbedView = sui.views.TabbedView;
	sui.views.TabbedView = tabbedView.extend({
		tabSwitcher: function() {
			tabbedView.prototype.tabSwitcher.apply( this, arguments );
			$('.shortcode-ui-post-select.select2-container').select2( "close" );
		}
	});

} )( jQuery );

},{}]},{},[1]);
