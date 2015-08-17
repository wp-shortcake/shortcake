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

add_action( 'init', function() {

	if ( ! function_exists( 'shortcode_ui_register_for_shortcode' ) ) {
		add_action( 'admin_notices', function(){
			if ( current_user_can( 'activate_plugins' ) ) {
				echo '<div class="error message"><p>Shortcode UI plugin must be active for Shortcode UI Example plugin to function.</p></div>';
			}
		});
		return;
	}

	add_shortcode( 'shortcake-no-attributes', '__return_false' );
	shortcode_ui_register_for_shortcode( 'no-attributes', array(
		'label'        => 'Shortcake With No Attributes',
		) );

	/**
	 * Register your shortcode as you would normally.
	 * This is a simple example for a pullquote with a citation.
	 */
	add_shortcode( 'shortcake_dev', function( $attr, $content = '' ) {

		$attr = wp_parse_args( $attr, array(
			'source'     => '',
			'attachment' => 0
		) );

		ob_start();

		?>

		<section class="pullquote" style="padding: 20px; background: rgba(0,0,0,0.1);">
			<p style="margin:0; padding: 0;">
				<b>Content:</b> <?php echo wpautop( wp_kses_post( $content ) ); ?></br>
				<b>Source:</b> <?php echo esc_html( $attr['source'] ); ?></br>
				<b>Image:</b> <?php echo wp_get_attachment_image( $attr['attachment'], array( 50, 50 ) ); ?></br>
			</p>
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
		'shortcake_dev',
		array(

			// Display label. String. Required.
			'label' => 'Shortcake Dev',

			// Icon/attachment for shortcode. Optional. src or dashicons-$icon. Defaults to carrot.
			'listItemImage' => 'dashicons-editor-quote',

			'inner_content' => array(
				'label' => 'Quote',
			),

			'post_type'     => array( 'post' ),

			// Available shortcode attributes and default values. Required. Array.
			// Attribute model expects 'attr', 'type' and 'label'
			// Supported field types: text, checkbox, textarea, radio, select, email, url, number, and date.
			'attrs' => array(

				array(
					'label' => 'Attachment',
					'attr'  => 'attachment',
					'type'  => 'attachment',
					'libraryType' => array( 'image' ),
					'addButton'   => 'Select Image',
					'frameTitle'  => 'Select Image',
					'multiple' => true,
				),

				array(
					'label' => 'Cite',
					'attr'  => 'source',
					'type'  => 'text',
					'meta' => array(
						'placeholder' => 'Test placeholder',
						'data-test'    => 1,
					),
				),

				array(
					'label'    => 'Select Page',
					'attr'     => 'page',
					'type'     => 'post_select',
					'query'    => array( 'post_type' => 'page' ),
					'multiple' => true,
				),

			),

		)
	);

} );
