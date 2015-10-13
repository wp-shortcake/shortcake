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

/**
 * If Shortcake isn't active, then this demo plugin doesn't work either
 */
add_action( 'init', 'shortcode_ui_detection' );
function shortcode_ui_detection() {
	if ( !function_exists( 'shortcode_ui_register_for_shortcode' ) ) {
		add_action( 'admin_notices', 'shortcode_ui_dev_example_notices' );
	}
}

function shortcode_ui_dev_example_notices() {
	if ( current_user_can( 'activate_plugins' ) ) {
		echo '<div class="error message"><p>Shortcode UI plugin must be active for Shortcode UI Example plugin to function.</p></div>';
	}
}

/**
 * An example shortcode with no attributes and minimal UI
 */
function shortcode_ui_dev_minimal_example() {
	add_shortcode( 'shortcake-no-attributes', '__return_false' );
	if ( ! function_exists( 'shortcode_ui_register_for_shortcode' ) ) {
		return;
	}
	shortcode_ui_register_for_shortcode( 'no-attributes', array(
	    'label' => 'Shortcake With No Attributes',
	) );
}
add_action( 'init', 'shortcode_ui_dev_minimal_example' );

/**
 * An example shortcode with many editable attributes (and more complex UI)
 */
function shortcode_ui_dev_advanced_example() {

	/**
	 * Register your shortcode as you would normally.
	 * This is a simple example for a pullquote with a citation.
	 */
	add_shortcode( 'shortcake_dev', 'shortcode_ui_dev_shortcode' );

	if ( ! function_exists( 'shortcode_ui_register_for_shortcode' ) ) {
		return;
	}

	/**
	 * Register UI for your shortcode
	 *
	 * @param string $shortcode_tag
	 * @param array $ui_args
	 */
	shortcode_ui_register_for_shortcode( 'shortcake_dev',
		array(
			/*
			 * How the shortcode should be labeled in the UI. Required argument.
			 */
			'label' => esc_html__( 'Shortcake Dev', 'shortcode-ui' ),
			/*
			 * Include an icon with your shortcode. Optional.
			 * Use a dashicon, or full URL to image.
			 */
			'listItemImage' => 'dashicons-editor-quote',
			/*
			 * Limit this shortcode UI to specific posts. Optional.
			 */
			'post_type' => array( 'post' ),
			/*
			 * Register UI for the "inner content" of the shortcode. Optional.
			 * If no UI is registered for the inner content, then any inner content
			 * data present will be backed up during editing.
			 */
			'inner_content' => array(
				'label'        => esc_html__( 'Quote', 'shortcode-ui' ),
				'description'  => esc_html__( 'Include a statement from someone famous.', 'shortcode-ui' ),
			),
			/*
			 * Register UI for attributes of the shortcode. Optional.
			 * Each array must include 'attr', 'type', and 'label'.
			 * Supported field types: text, checkbox, textarea, radio, select, email, url, number, and date, post_select, attachment, color.
			 * Use 'meta' to add arbitrary attributes to the HTML of the field.
			 * Use 'encode' to encode attribute data. Requires customization to callback to decode.
			 * Depending on 'type', additional arguments may be available.
			 */
			'attrs' => array(
				array(
					'label'       => esc_html__( 'Attachment', 'shortcode-ui' ),
					'attr'        => 'attachment',
					'type'        => 'attachment',
					/*
					 * These arguments are passed to the instantiation of the media library:
					 * 'libraryType' - Type of media to make available.
					 * 'addButton' - Text for the button to open media library.
					 * 'frameTitle' - Title for the modal UI once the library is open.
					 */
					'libraryType' => array( 'image' ),
					'addButton'   => esc_html__( 'Select Image', 'shortcode-ui' ),
					'frameTitle'  => esc_html__( 'Select Image', 'shortcode-ui ' ),
				),
				array(
					'label'  => esc_html__( 'Citation Source', 'shortcode-ui' ),
					'attr'   => 'source',
					'type'   => 'text',
					'encode' => true,
					'meta'   => array(
						'placeholder' => esc_html__( 'Test placeholder', 'shortcode-ui' ),
						'data-test'   => 1,
					),
				),
				array(
					'label' => esc_html__( 'Select Page', 'shortcode-ui' ),
					'attr' => 'page',
					'type' => 'post_select',
					'query' => array( 'post_type' => 'page' ),
					'multiple' => true,
				),
			),
		)
	);
}
add_action( 'init', 'shortcode_ui_dev_advanced_example' );

/**
 * Render the shortcode based on supplied attributes
 */
function shortcode_ui_dev_shortcode( $attr, $content = '', $shortcode_tag ) {

	$attr = shortcode_atts( array(
		'source'     => '',
		'attachment' => 0,
		'source'     => null,
	), $attr, $shortcode_tag );

	ob_start();

	?>

	<section class="pullquote" style="padding: 20px; background: rgba(0,0,0,0.1);">
		<p style="margin:0; padding: 0;">
		<b>Content:</b> <?php echo wpautop( wp_kses_post( $content ) ); ?></br>
		<b>Source:</b> <?php echo wp_kses_post( $attr[ 'source' ] ); ?></br>
		<b>Image:</b> <?php echo wp_kses_post( wp_get_attachment_image( $attr[ 'attachment' ], array( 50, 50 ) ) ); ?></br>
		</p>
	</section>

	<?php

	return ob_get_clean();

}
