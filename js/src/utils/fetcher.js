var $ = require('jquery');
var _ = require('underscore');

var Fetcher = (function() {
	var fetcher = this;

	this.counter = 0;
	this.queries = [];
	this.timeout = null;

	/**
	 * Add a query to the queue.
	 *
	 * Returns a promise that will be resolved when the query is successfully
	 * returned.
	 */
	this.queueToFetch = function( query ) {
		var fetchPromise = new $.Deferred();

		query.counter = ++fetcher.counter;

		fetcher.queries.push({
			promise: fetchPromise,
			query: query,
			counter: query.counter
		});

		if ( ! fetcher.timeout ) {
			fetcher.timeout = setTimeout(
				fetcher.fetchAll, 200
			);
		}
		return fetchPromise;
	};

	/**
	 * Execute all queued queries.
	 *
	 * Resolves their respective promises.
	 */
	this.fetchAll = function() {
		var request = $.post( ajaxurl + '?action=bulk_do_shortcode', {
				queries: _.pluck( fetcher.queries, 'query' )
			}
		);

		delete fetcher.timeout;

		request.done( function( response ) {
			_.each( response.data, function( result, index ) {
				var matchedQuery = _.findWhere( fetcher.queries, {
					counter: parseInt( index ),
				});
				fetcher.queries = _.without( fetcher.queries, matchedQuery );
				matchedQuery.promise.resolve( result );
			} );
		} );
	};

	// Public API methods available
	return {
		queueToFetch : this.queueToFetch,
		fetchAll     : this.fetchAll
	};

})();

module.exports = Fetcher;
