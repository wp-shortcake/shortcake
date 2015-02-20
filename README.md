Shortcake
============

Shortcake makes WordPress shortcodes a piece of cake.

Used alongside `add_shortcode`, Shortcake supplies a user-friendly interface for adding a shortcode to a post, and viewing and editing it from within the content editor.

See:

* [Usage](#usage)
* [Examples](#examples)
* [Screenshots](#screenshots)
* [Known Issues](#known-issues)

## Usage

```php
add_action( 'init', function() {

	/**
	 * Register your shortcode as you would normally.
	 * This is a simple example for a pullquote with a citation.
	 */
	add_shortcode( 'pullquote', function( $attr, $content = '' ) {

		$attr = wp_parse_args( $attr, array(
			'source' => ''
		) );

		ob_start();

		?>

		<section class="pullquote">
			<?php echo esc_html( $content ); ?><br/>
			<?php if ( ! empty( $attr['source'] ) ) : ?>
				<cite><em><?php echo esc_html( $attr['source'] ); ?></em></cite>
			<?php endif; ?>
		</section>

		<?php

		return ob_get_clean();
	} );

	/**
	 * Register a UI for the Shortcode.
	 * Pass the shortcode tag (string)
	 * and an array or args.
	 */
	shortcode_ui_register_for_shortcode(
		'pullquote',
		array(

			// Display label. String. Required.
			'label' => 'Pullquote',

			// Icon/image for shortcode. Optional. src or dashicons-$icon. Defaults to carrot.
			'listItemImage' => 'dashicons-editor-quote',

			// Available shortcode attributes and default values. Required. Array.
			// Attribute model expects 'attr', 'type' and 'label'
			// Supported field types: text, checkbox, textarea, radio, select, email, url, number, and date.
			'attrs' => array(
				array(
					'label' => 'Quote',
					'attr'  => 'content',
					'type'  => 'textarea',
				),
				array(
					'label'       => 'Cite',
					'attr'        => 'source',
					'type'        => 'text',
					'placeholder' => 'Firstname Lastname',
					'description' => 'Optional',
				),
			),
		)
	);

} );

````

[Install the demo plugin using this snippet](https://gist.github.com/Mte90/cb8a0e37565d219062ec)

## Examples

* Per Søderlind [@soderlind](https://twitter.com/soderlind) uses Shortcake to insert charts and tables. [See the screencast](http://screencast.com/t/ZJ1u3CvKF5uq)

## Screenshots

Take a look at this demo of Fusion's pullquote shortcode.

Without Shortcake, shortcodes have a minimal UI:
![no-shortcake](https://cloud.githubusercontent.com/assets/36432/5930132/7351524e-a640-11e4-9246-543ee8138397.png)

But with Shortcake, TinyMCE will render the shortcode in a TinyMCE view:
![shortcake](https://cloud.githubusercontent.com/assets/36432/5930148/99c404c6-a640-11e4-995d-76f6101277fe.png)

And add a user-friendly UI to edit shortcode content and attributes:
![editor](https://cloud.githubusercontent.com/assets/36432/5930154/ad46c38a-a640-11e4-904e-20b09c15b980.png)

Add new shortcodes to your post through "Add Media":

![add-new](https://cloud.githubusercontent.com/assets/36432/5930160/caca5ba6-a640-11e4-9cc7-3b8ae92c422f.png)

## Known issues

* You cannot use camelcase or hyphens in attribute names.
* If your shortcode output is not a block level element, it may display oddly in the TinyMCE editor.
