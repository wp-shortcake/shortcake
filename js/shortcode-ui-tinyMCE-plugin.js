tinymce.PluginManager.add('shortcodeui', function( ed ) {

	ed.addCommand( 'Shortcode_UI_Edit', function( shortcode ) {
		if ( typeof Shortcode_UI !== 'undefined' && Shortcode_UI.modal ) {
			Shortcode_UI.modal.openEditModal( shortcodeToModel( shortcode.html() ), shortcode );
		}
	});

	ed.addCommand( 'Shortcode_UI_Update', function( shortcode, markerEl ) {
		markerEl.replaceWith( shortcode );
	});

	ed.on( 'BeforeSetContent', function( event ) {
		// Remove event before attaching to prevent getting attached multiple times.
		ed.off("click", clickShortcodeCallback );
		ed.on( "click", clickShortcodeCallback );
	});

	ed.on( 'PostProcess', function( event ) {});

	var shortcodeToModel = function( shortcodeString ) {

		var model, attributes = [];

		var matches = shortcodeString.match( /\[([^\s\]\/]+) ?([^\]]+)?\]/ );

		model = Shortcode_UI.shortcodes.findWhere( {shortcode: matches[1] } );

		if ( ! model ) {
			return;
		}

		if ( typeof( matches[2] ) != undefined ) {

			attributes = matches[2].split( ' ' );

			// convert attribute strings to object.
			for ( var i = 0; i < attributes.length; i++ ) {

				var bits = attributes[i].split('=');
				var attr = model.get( 'shortcodeAtts').findWhere( { id: bits[0] } );

				if ( attr ) {
					attr.set( 'value', bits[1].slice(1,-1) ); // note slice - remove ". @todo - make more robust.
				}

			}

		}

		// Try and match content field.
		var matches2 = shortcodeString.match( /\[test_shortcode([^\]]+)?\]([^\[]+)?\[\/test_shortcode\]/ );
		if ( matches2 ) {
			model.set( 'content', matches2[2] );
		}

		return model;

	}

	var clickShortcodeCallback = function(e) {

        var shortcode = jQuery( e.target ).closest( '.shortcode-ui' );
        if ( shortcode.length > 0 ) {
        	ed.execCommand( "Shortcode_UI_Edit", shortcode );
        }

    }

});