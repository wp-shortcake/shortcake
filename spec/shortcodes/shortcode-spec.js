define( ['squire', 'chai'], function( Squire, chai ) {
    'use strict';

	var expect = chai.expect;	// Override default assertion library.
	var injector;

	describe( "The Shortcode model", function() {
		var ctx = {};

		beforeEach( function( done ) {
			injector = new Squire();
			injector
				.store( 'shortcodes/attribute.collection' )
				.require( ['shortcodes/shortcode.model', 'mocks'], function( Shortcode, mocks ) {
					ctx.Shortcode	= Shortcode;
					ctx.AttributeCollection = mocks.store['shortcodes/attribute.collection'];

					done();
				});
		});

		afterEach( function() {
			injector.remove();
			ctx = {};
		});

		it( "should be initialized with appropriate defaults", function() {
			var shortcode = new ctx.Shortcode();

			expect( shortcode ).to.exist();
			expect( shortcode ).to.be.an.instanceOf( ctx.Shortcode );

			expect( shortcode.get( 'label' ) ).to.exist();
			expect( shortcode.get( 'label' ) ).to.equal( "" );

			expect( shortcode.get( 'shortcode_tag' ) ).to.exist();
			expect( shortcode.get( 'shortcode_tag' ) ).to.equal( "" );

			expect( shortcode.get( 'attrs' ) ).to.exist();
			expect( shortcode.get( 'attrs' ) ).to.be.an.instanceOf( ctx.AttributeCollection );
		});

		describe( "should cast shortcode attributes ('attrs') to an AttributesCollection via #set()", function() {
			it( "when passed as a hash", function() {
				var shortcode = new ctx.Shortcode();

				shortcode.set({ 'attrs': [] });
				expect( shortcode.get( 'attrs' ) ).to.be.an.instanceOf( ctx.AttributeCollection );
			});

			it( "when passed as individual key and value", function() {
				var shortcode = new ctx.Shortcode();

				shortcode.set( 'attrs', [] );
				expect( shortcode.get( 'attrs' ) ).to.be.an.instanceOf( ctx.AttributeCollection );
			});
		});
	});

	return {};
});