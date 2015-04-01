=== Shortcake (Shortcode UI) ===
Contributors: mattheu, danielbachhuber, zebulonj, jitendraharpalani, sanchothefat, bfintal, davisshaver
Tags: shortcodes
Requires at least: 4.1
Tested up to: 4.2
Stable tag: 0.2.1
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Shortcake makes using WordPress shortcodes a piece of cake.

== Description ==

Used alongside `add_shortcode`, Shortcake supplies a user-friendly interface for adding a shortcode to a post, and viewing and editing it from within the content editor.

See the "Installation" for implementation notes. To report bugs or feature requests, [please use Github issues](https://github.com/fusioneng/Shortcake/issues).

== Installation ==

Shortcake can be installed like any other WordPress plugin. Once you've done so, you'll need to register the UI for your code:

```
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
```

Or, [install the demo plugin using this snippet](https://gist.github.com/Mte90/cb8a0e37565d219062ec).

== Screenshots ==

1. Without Shortcake, shortcodes have a minimal UI.
2. But with Shortcake, TinyMCE will render the shortcode in a TinyMCE view.
3. And add a user-friendly UI to edit shortcode content and attributes.
4. Add new shortcodes to your post through "Add Media".

== Changelog ==

= 0.2.1 (March 18, 2015) =

* Ensure use of jQuery respects jQuery.noConflict() mode in WP.

= 0.2.0 (March 18, 2015) =

* JS abstracted using Browserify.
* Enhancements to "Add Post Element" UI: shortcodes sorted alphabetically; search based on label.
* Much easier to select shortcode previews that include iframes.
* WordPress 4.2 compatibility.
* Added color picker to list of potential fields.
* Bug fix: IE11 compatibility.
* Bug fix: Checkbox field can now be unchecked.
* [Full release notes](http://fusion.net/story/105889/shortcake-v0-2-0-js-abstraction-add-post-element-enhancements-inner-content-field/).

= 0.1.0 (December 23, 2014) =

* Supports all HTML5 input types for form fields.
* Shortcode preview tab within the editing experience.
* Re-labeled the UI around “Post Elements”, which is more descriptive than “Content Items.”
* Many bug fixes.
* [Full release notes](http://next.fusion.net/2014/12/23/shortcake-v0-1-0-live-previews-fieldmanager-integration/).

