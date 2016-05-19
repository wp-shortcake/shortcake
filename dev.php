<?php
/**
 * Plugin Name: Shortcode UI Example
 * Version: 1.0.0
 * Description: Adds [shortcake_dev] and [shortcake-no-attributes] example shortcodes to see Shortcode UI in action.
 * Author: Fusion Engineering and community
 * Author URI: http://next.fusion.net/tag/shortcode-ui/
 * Text Domain: shortcode-ui-example
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

/*
 * This plugin handles the registration of two shortcodes, and the related Shortcode UI:
 *  a. [shortcode-no-attributes] - a shortcode with a minimal UI example that has no user inputs.
 *  b. [shortcode_dev] - a shortcode with a selection of user inputs.
 *
 * The plugin is broken down into four stages:
 *  0. Check to see if Shortcake is running, with an admin notice if not.
 *  1. Register the shortcodes - this is standard WP behaviour, nothing new here.
 *  2. Register the Shortcode UI setup for shortcodes.
 *  3. Define the callback for the advanced shortcode - fairly standard WP behaviour, nothing new here.
 */

/*
 * 0. Check to see if Shortcake is running, with an admin notice if not.
 */

add_action( 'init', 'shortcode_ui_detection' );
/**
 * If Shortcake isn't active, then add an administration notice.
 *
 * This check is optional. The addition of the shortcode UI is via an action hook that is only called in Shortcake.
 * So if Shortcake isn't active, you won't be presented with errors.
 *
 * Here, we choose to tell users that Shortcake isn't active, but equally you could let it be silent.
 *
 * Why not just self-deactivate this plugin? Because then the shortcodes would not be registered either.
 *
 * @since 1.0.0
 */
function shortcode_ui_detection() {
	if ( ! function_exists( 'shortcode_ui_register_for_shortcode' ) ) {
		add_action( 'admin_notices', 'shortcode_ui_dev_example_notices' );
	}
}

/**
 * Display an administration notice if the user can activate plugins.
 *
 * If the user can't activate plugins, then it's poor UX to show a notice they can't do anything to fix.
 *
 * @since 1.0.0
 */
function shortcode_ui_dev_example_notices() {
	if ( current_user_can( 'activate_plugins' ) ) {
		?>
		<div class="error message">
			<p><?php esc_html_e( 'Shortcode UI plugin must be active for Shortcode UI Example plugin to function.', 'shortcode-ui-example' ); ?></p>
		</div>
		<?php
	}
}




/*
 * 1. Register the shortcodes.
 */

add_action( 'init', 'shortcode_ui_dev_register_shortcodes' );
/**
 * Register two shortcodes, shortcake_dev and shortcake-no-attributes.
 *
 * This registration is done independently of any UI that might be associated with them, so it always happens, even if
 * Shortcake is not active.
 *
 * @since 1.0.0
 */
function shortcode_ui_dev_register_shortcodes() {
	// This shortcode doesn't actually do anything.
	add_shortcode( 'shortcake-no-attributes', '__return_false' );

	// This is a simple example for a pullquote with a citation.
	add_shortcode( 'shortcake_dev', 'shortcode_ui_dev_shortcode' );
}




/*
 * 2. Register the Shortcode UI setup for the shortcodes.
 */

add_action( 'register_shortcode_ui', 'shortcode_ui_dev_minimal_example' );
/**
 * Shortcode UI setup for the shortcake-no-attributes shortcode.
 *
 * It is called when the Shortcake action hook `register_shortcode_ui` is called.
 *
 * This example shortcode has no attributes and minimal UI.
 *
 * @since 1.0.0
 */
function shortcode_ui_dev_minimal_example() {
	shortcode_ui_register_for_shortcode(
		'shortcake-no-attributes', // Shortcode tag this UI is for.
		array(                     // Shortcode UI args.
		                           'label' => esc_html__( 'Shortcake With No Attributes', 'shortcode-ui-example' ),
		)
	);
}

add_action( 'register_shortcode_ui', 'shortcode_ui_dev_advanced_example' );
/**
 * Shortcode UI setup for the shortcake_dev shortcode.
 *
 * It is called when the Shortcake action hook `register_shortcode_ui` is called.
 *
 * This example shortcode has many editable attributes, and more complex UI.
 *
 * @since 1.0.0
 */
function shortcode_ui_dev_advanced_example() {
	/*
	 * Define the UI for attributes of the shortcode. Optional.
	 *
	 * In this demo example, we register multiple fields related to showing a quotation
	 * - Attachment, Citation Source, Select Page, Background Color, Alignment and Year.
	 *
	 * If no UI is registered for an attribute, then the attribute will
	 * not be editable through Shortcake's UI. However, the value of any
	 * unregistered attributes will be preserved when editing.
	 *
	 * Each array must include 'attr', 'type', and 'label'.
	 * * 'attr' should be the name of the attribute.
	 * * 'type' options include: text, checkbox, textarea, radio, select, email,
	 *     url, number, and date, post_select, attachment, color.
	 * * 'label' is the label text associated with that input field.
	 *
	 * Use 'meta' to add arbitrary attributes to the HTML of the field.
	 *
	 * Use 'encode' to encode attribute data. Requires customization in shortcode callback to decode.
	 *
	 * Depending on 'type', additional arguments may be available.
	 */
	$fields = array(
		array(
			'label'       => esc_html__( 'Attachment', 'shortcode-ui-example' ),
			'attr'        => 'attachment',
			'type'        => 'attachment',
			/*
			 * These arguments are passed to the instantiation of the media library:
			 * 'libraryType' - Type of media to make available.
			 * 'addButton'   - Text for the button to open media library.
			 * 'frameTitle'  - Title for the modal UI once the library is open.
			 */
			'libraryType' => array( 'image' ),
			'addButton'   => esc_html__( 'Select Image', 'shortcode-ui-example' ),
			'frameTitle'  => esc_html__( 'Select Image', 'shortcode-ui-example' ),
		),
		array(
			'label'  => esc_html__( 'Citation Source', 'shortcode-ui-example' ),
			'attr'   => 'source',
			'type'   => 'text',
			'encode' => true,
			'meta'   => array(
				'placeholder' => esc_html__( 'Test placeholder', 'shortcode-ui-example' ),
				'data-test'   => 1,
			),
		),
		array(
			'label'    => esc_html__( 'Select Page', 'shortcode-ui-example' ),
			'attr'     => 'page',
			'type'     => 'post_select',
			'query'    => array( 'post_type' => 'page' ),
			'multiple' => true,
		),
		array(
			'label'    => esc_html__( 'Select Term', 'shortcode-ui-example' ),
			'attr'     => 'term',
			'type'     => 'term_select',
			'taxonomy' => 'post_tag',
			'multiple' => true,
		),
		array(
			'label'  => esc_html__( 'Background Color', 'shortcode-ui-example' ),
			'attr'   => 'background-color',
			'type'   => 'color',
			'encode' => true,
			'meta'   => array(
				'placeholder' => esc_html__( 'Hex color code', 'shortcode-ui-example' ),
			),
		),
		array(
			'label'       => esc_html__( 'Alignment', 'shortcode-ui-example' ),
			'description' => esc_html__( 'Whether the quotation should be displayed as pull-left, pull-right, or neither.', 'shortcode-ui-example' ),
			'attr'        => 'alignment',
			'type'        => 'select',
			'options'     => array(
				''      => esc_html__( 'None', 'shortcode-ui-example' ),
				'left'  => esc_html__( 'Pull Left', 'shortcode-ui-example' ),
				'right' => esc_html__( 'Pull Right', 'shortcode-ui-example' ),
			),
		),
		array(
			'label'       => esc_html__( 'Year', 'shortcode-ui-example' ),
			'description' => esc_html__( 'Optional. The year the quotation is from.', 'shortcode-ui-example' ),
			'attr'        => 'year',
			'type'        => 'number',
			'meta'        => array(
				'placeholder' => 'YYYY',
				'min'         => '1990',
				'max'         => date_i18n( 'Y' ),
				'step'        => '1',
			),
		),
	);

	/*
	 * Define the Shortcode UI arguments.
	 */
	$shortcode_ui_args = array(
		/*
		 * How the shortcode should be labeled in the UI. Required argument.
		 */
		'label' => esc_html__( 'Shortcake Dev', 'shortcode-ui-example' ),

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
		 * data present will be backed-up during editing.
		 */
		'inner_content' => array(
			'label'        => esc_html__( 'Quote', 'shortcode-ui-example' ),
			'description'  => esc_html__( 'Include a statement from someone famous.', 'shortcode-ui-example' ),
		),

		/*
		 * Define the UI for attributes of the shortcode. Optional.
		 *
		 * See above, to where the the assignment to the $fields variable was made.
		 */
		'attrs' => $fields,
	);

	shortcode_ui_register_for_shortcode( 'shortcake_dev', $shortcode_ui_args );
}




/*
 * 3. Define the callback for the advanced shortcode.
 */

/**
 * Callback for the shortcake_dev shortcode.
 *
 * It renders the shortcode based on supplied attributes.
 */
function shortcode_ui_dev_shortcode( $attr, $content, $shortcode_tag ) {
	$attr = shortcode_atts( array(
		'source'     => '',
		'attachment' => 0,
		'page'       => null,
	), $attr, $shortcode_tag );

	// Shortcode callbacks must return content, hence, output buffering here.
	ob_start();
	?>
	<section class="pullquote" style="padding: 20px; background: rgba(0, 0, 0, 0.1);">
		<p style="margin:0; padding: 0;">
			<b><?php esc_html_e( 'Content:', 'shortcode-ui-example' ); ?></b> <?php echo wpautop( wp_kses_post( $content ) ); ?></br>
			<b><?php esc_html_e( 'Source:', 'shortcode-ui-example' ); ?></b> <?php echo wp_kses_post( $attr[ 'source' ] ); ?></br>
			<b><?php esc_html_e( 'Image:', 'shortcode-ui-example' ); ?></b> <?php echo wp_kses_post( wp_get_attachment_image( $attr[ 'attachment' ], array( 50, 50 ) ) ); ?></br>
		</p>
	</section>
	<?php

	return ob_get_clean();
}
