Shortcode-UI
============

Add different content blocks to the WordPress tinyMCE editor using shortcodes!

This is a tool to be used alongside add_shortcode to add a user friendly interface for adding shortcodes and viewing them inside the content editor.

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
			// Attribute model expects 'attr', 'type' and 'label'
			'attrs' => array(
				array(
					'label' => 'Quote',
					'attr'  => 'content',
					'type'  => 'textarea',
				),
				array(
					'label' => 'Cite',
					'attr'  => 'source',
					'type'  => 'text',
				),
			),

	) );

} );
````

## Known issues

* You cannot use camelcase or hyphens in attribute names.
* If your shortcode output is not a block level element, it may display wierdly in the TinyMCE editor.