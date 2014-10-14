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

		var model, attributes = [];

		var matches = shortcodeString.match( /\[([^\s\]\/]+) ?([^\]]+)?\]/ );

		if ( ! matches ) {
			return;
		}

		model = Shortcode_UI.shortcodes.findWhere( {shortcode: matches[1] } );

		if ( ! model ) {
			return;
		}

		if ( typeof( matches[2] ) != undefined ) {

			attributes = matches[2].match(/(\S+?=".*?")/g );

			// convert attribute strings to object.
			for ( var i = 0; i < attributes.length; i++ ) {

				var bitsRegEx = /(\S+?)="(.*?)"/g;
				var bits = bitsRegEx.exec( attributes[i] );

				// var bits = attributes[i].match( /(\S+?)="(.*?)"/g )
				// console.log( bits );

				// console.log( bits );
				var attr = model.get( 'shortcodeAtts').findWhere( { id: bits[1] } );

				if ( attr ) {
					// attr.set( 'value', bits[2].slice(1,-1) ); // note slice - remove ". @todo - make more robust.
					attr.set( 'value', bits[2] ); // note slice - remove ". @todo - make more robust.

				}

			}

		}

		// Try and match content field.
		//
		// var contentRegEx = "/\\[" + matches[1] + "([^\\]]+)?\\]([^\\[]+)?\\[\/" + matches[1] + "\\]/";


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