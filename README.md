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
			<cite><em><?php echo esc_html( $attr['source'] ); ?></em></cite>
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
					'label' => 'Cite',
					'attr'  => 'source',
					'type'  => 'text',
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
Without Shortcake, shortcodes have a minimal UI.
![no-shortcake](https://cloud.githubusercontent.com/assets/1636964/4981504/a4f1ff98-6909-11e4-8406-aa8a7bba4f4e.png)

But with Shortcake, TinyMCE will render the shortcode in a TinyMCE view.
![shortcake](https://cloud.githubusercontent.com/assets/1636964/4981503/a056e7a0-6909-11e4-925a-0e4e4cb6e812.png)

And add a user-friendly UI to edit shortcode content and attributes.
![screen shot 2014-11-10 at 1 48 29 pm](https://cloud.githubusercontent.com/assets/1636964/4981557/37ddc5e4-690a-11e4-8fb5-089ed4b31336.png)

## Known issues

* You cannot use camelcase or hyphens in attribute names.
* If your shortcode output is not a block level element, it may display oddly in the TinyMCE editor.
