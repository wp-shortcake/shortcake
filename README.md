Shortcode-UI
============

Add different content blocks to the WordPress tinyMCE editor using shortcodes.

This is a wrapper for add_shortcode that also creates a UI for adding the shortcode, as well as handling the rendering of the shortcode output - both on the front end of the site and in the TinyMCE editor.

## Usage.

```php
add_action( 'init', function() {

	$shortcode_ui = Shortcode_UI::get_instance();

	$shortcode_ui->register_shortcode_ui(
		'blockquote',
		array(

			// Display label. String. Required.
			'label' => 'Blockquote',

			// Icon/image for shortcode. Optional. src or dashicons-$icon. Defaults to carrot.
			'listItemImage' => 'dashicons-editor-quote',

			// Available shortcode attributes and default values. Required. Array.
			// Format 'id' => 'default value'
			'attrs' => array(
				'align'     => 'left',
				'source'    => '',
				'sourceurl' => '',
			),

			// Edit form Template
			// String. Path of the file that contains the template.
			// This should be a <script type="text/html"> containing an underscore template.
			// The ID of this template should be 'shortcode-$shortcode-edit-form''
			// Optional - by default displays inputs for all attributes.
			'template-edit-form' => plugin_dir_path( __FILE__ ) . 'inc/templates/shortcode-blockquote-edit-form.tpl.php',

			// Render shortcode template.
			// String. Path of the file that contains the template.
			// This is a php template file that is output by the shortcode.
			// The variables available in the template are $shortcode, $content and $attrs.
			// This is also the template used in the tinyMCE editor. You may need to include styles for this in your editor styles.
			'template-render'    => plugin_dir_path( __FILE__ ) . 'inc/templates/shortcode-blockquote-render.tpl.php',

	) );

} );
````

## Known issues

* You cannot use camelcase or hyphens in attribute names.
* If your shortcode output is not a block level element, it may display wierdly in the TinyMCE editor.