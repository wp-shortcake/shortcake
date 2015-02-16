<?php
/**
 * Plugin Name: Shortcode UI
 * Version: v0.2.0-dev
 * Description: User Interface for adding shortcodes.
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

require_once dirname( __FILE__ ) . '/inc/class-shortcode-ui.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-fields.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-field-attachment.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-field-post-select.php';

add_action( 'init', function() {

	$shortcode_ui      = Shortcode_UI::get_instance();
	$fields            = Shortcode_UI_Fields::get_instance();
	$attachment_field  = Shortcake_Field_Attachment::get_instance();
	$post_select_field = Shortcake_Field_Post_Select::get_instance();

	// Add fieldmanager fields if plugin is available.
	if ( class_exists( 'Fieldmanager_Field' ) ) {
		require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-fields-fieldmanager.php';
		$fieldmanager = Shortcode_UI_Fields_Fieldmanager::get_instance();
	}

}, 5 );

/**
 * Register UI for Shortcode
 *
 * @param  string $shortcode_tag
 * @param  array  $args
 * @return null
 */
function shortcode_ui_register_for_shortcode( $shortcode_tag, $args = array() ) {
	Shortcode_UI::get_instance()->register_shortcode_ui( $shortcode_tag, $args );
}

/**
 * Get register UI args by shortcode tag
 *
 * @param  string $shortcode_tag
 * @param  array  $args
 * @return null
 */
function shortcode_ui_get_register_shortcode( $shortcode_tag, $args = array() ) {
	return Shortcode_UI::get_instance()->get_shortcode( $shortcode_tag );
}
