<?php
/**
 * Plugin Name: Shortcode UI Example
 * Version: v1.0
 * Description: Adds [shortcake_dev] example shortcode to see Shortcode UI in action
 * Author: Fusion Engineering and community
 * Author URI: http://next.fusion.net/tag/shortcode-ui/
 * Text Domain: shortcode-ui
 * License: GPL v2 or later
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
add_action( 'init', 'shortcode_ui_detection' );

function shortcode_ui_detection() {
	if ( !function_exists( 'shortcode_ui_register_for_shortcode' ) ) {
		add_action( 'admin_notices', 'shortcode_ui_dev_example_notices' );
		return;
	}
}

function shortcode_ui_dev_example_notices() {
	if ( current_user_can( 'activate_plugins' ) ) {
		echo '<div class="error message"><p>Shortcode UI plugin must be active for Shortcode UI Example plugin to function.</p></div>';
	}
}

add_action( 'init', 'shortcode_ui_dev_minimal_example' );

function shortcode_ui_dev_minimal_example() {


	add_shortcode( 'shortcake-no-attributes', '__return_false' );
	shortcode_ui_register_for_shortcode( 'no-attributes', array(
		'label' => 'Shortcake With No Attributes',
	) );
}

add_action( 'init', 'shortcode_ui_dev_advanced_example' );

function shortcode_ui_dev_advanced_example() {

	/**
	 * Register your shortcode as you would normally.
	 * This is a simple example for a pullquote with a citation.
	 */
	add_shortcode( 'shortcake_dev', 'shortcode_ui_dev_shortcode' );

	/**
	 * Register a UI for the Shortcode.
	 * Pass the shortcode tag (string)
	 * and an array or args.
	 */
	shortcode_ui_register_for_shortcode(
		'shortcake_dev', array(
		'label' => 'Shortcake Dev', // Display label. String. Required.
		'listItemImage' => 'dashicons-editor-quote', // Icon/attachment for shortcode. Optional. src or dashicons-$icon. Defaults to carrot.
		'inner_content' => array(
		'label' => 'Quote',
		),
		'post_type' => array( 'post' ), //Post type support
		// Available shortcode attributes and default values. Required. Array.
		// Attribute model expects 'attr', 'type' and 'label'
		// Supported field types: text, checkbox, textarea, radio, select, email, url, number, and date.
		'attrs' => array(
		array(
			'label' => esc_html__( 'Attachment', 'your-text-domain' ), // Field label
			'attr' => 'attachment', // Field type
			'type' => 'attachment',
			'libraryType' => array( 'image' ), // Media type to insert
			'addButton' => esc_html__( 'Select Image', 'your-text-domain' ), // Button text that opens Media Library
			'frameTitle' => esc_html__( 'Select Image', 'your-text-domain ' ), // Media Library frame title
		),
		array(
			'label' => esc_html__( 'Citation Source', 'your-text-domain' ),
			'attr' => 'source',
			'type' => 'text',
			'meta' => array( // Holds custom field attributes.
			'placeholder' => 'Test placeholder',
			'data-test' => 1, // Custom data attribute
			),
		),
		array(
			'label' => 'Select Page',
			'attr' => 'page',
			'type' => 'post_select',
			'query' => array( 'post_type' => 'page' ),
			'multiple' => true,
		),
		),
		)
	);
}

function shortcode_ui_dev_shortcode( $attr, $content = '' ) {

	//Parse the attribute of the shortcode
	$attr = wp_parse_args( $attr, array(
		'source' => '',
		'attachment' => 0
		) );

	ob_start();
	?>

	<section class="pullquote" style="padding: 20px; background: rgba(0,0,0,0.1);">
		<p style="margin:0; padding: 0;">
		<b>Content:</b> <?php echo wpautop( wp_kses_post( $content ) ); ?></br>
		<b>Source:</b> <?php echo esc_html( $attr[ 'source' ] ); ?></br>
		<b>Image:</b> <?php echo wp_kses_post( wp_get_attachment_image( $attr[ 'attachment' ], array( 50, 50 ) ) ); ?></br>
		</p>
	</section>

	<?php
	return ob_get_clean();
}
