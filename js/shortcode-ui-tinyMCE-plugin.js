tinymce.PluginManager.add('shortcodeui', function( ed ) {

	ed.addCommand( 'Shortcode_UI_Edit', function( shortcode ) {
		if ( typeof Shortcode_UI !== 'undefined' && Shortcode_UI.modal ) {
			var model = shortcodeToModel( shortcode.html() );
			if ( model ) {
				Shortcode_UI.modal.openEditModal( model, shortcode );
			}
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

		var model, attrs;

		var matches = shortcodeString.match( /\[([^\s\]\/]+) ?([^\]]+)?\]/ );

		if ( ! matches ) {
			return;
		}

		model = Shortcode_UI.shortcodes.findWhere( {shortcode: matches[1] } );

		if ( ! model ) {
			return;
		}

		attrs = model.get( 'attrs' );

		if ( typeof( matches[2] ) != undefined ) {

			attributeMatches = matches[2].match(/(\S+?=".*?")/g );

			// convert attribute strings to object.
			for ( var i = 0; i < attributeMatches.length; i++ ) {

				var bitsRegEx = /(\S+?)="(.*?)"/g;
				var bits = bitsRegEx.exec( attributeMatches[i] );

				if ( bits[1] in attrs ) {
					attrs[ bits[1] ] = bits[2];
				}

			}

		}

		model.set( 'attrs', attrs ); // note slice - remove ". @todo - make more robust.

		var bitsRegExp = new RegExp( "\\[" + matches[1] + "([^\\]]+)?\\]([^\\[]*)?(\\[/" + matches[1] + "\\])?" );
		var bits       = bitsRegExp.exec( shortcodeString );

		if ( bits && bits[2] ) {
			model.set( 'content', bits[2] );
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