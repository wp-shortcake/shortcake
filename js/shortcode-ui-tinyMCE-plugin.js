tinymce.PluginManager.add('shortcodeui', function( ed ) {

	ed.addCommand( 'Shortcode_UI_Update', function( shortcode, markerEl ) {

		markerEl.replaceWith( shortcode );

		// var content = ed.getContent();
		// ed.setContent( content );

	});

});