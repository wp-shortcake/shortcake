<?php
/**
 * Plugin Name: Shortcake (Shortcode UI)
 * Version: 0.7.3
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

define( 'SHORTCODE_UI_VERSION', '0.7.3' );

require_once dirname( __FILE__ ) . '/inc/class-shortcode-ui.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-fields.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-field-attachment.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-field-color.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-field-post-select.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-field-term-select.php';
require_once dirname( __FILE__ ) . '/inc/fields/class-shortcode-ui-field-user-select.php';

add_action( 'init', 'shortcode_ui_load_textdomain' );

add_action( 'init', 'shortcode_ui_init', 5 );

/**
 * Init Shortcake
 *
 * @return null
 */
function shortcode_ui_init() {

	if ( defined( 'SELECT2_NOCONFLICT' ) && SELECT2_NOCONFLICT ) {
		Shortcode_UI::$select2_handle = 'select2v4';
	}

	$shortcode_ui     = Shortcode_UI::get_instance();
	$fields           = Shortcode_UI_Fields::get_instance();
	$attachment_field = Shortcode_UI_Field_Attachment::get_instance();
	$color_field      = Shortcode_UI_Field_Color::get_instance();
	$post_field       = Shortcode_UI_Field_Post_Select::get_instance();
	$term_field       = Shortcode_UI_Field_Term_Select::get_instance();
	$user_field       = Shortcode_UI_Field_User_Select::get_instance();
}

/**
 * Load translations
 *
 * @return null
 */
function shortcode_ui_load_textdomain() {
	// Don't use load_plugin_textdomain because it doesn't support non-standard directories
	// See https://core.trac.wordpress.org/ticket/23794
	$locale = get_locale();
	$domain = 'shortcode-ui';
	$locale = apply_filters( 'plugin_locale', $locale, $domain );
	$path = dirname( __FILE__ ) . '/languages';
	// Load the textdomain according to the plugin first
	$mofile = $domain . '-' . $locale . '.mo';
	$loaded = load_textdomain( $domain, $path . '/' . $mofile );

	// If not loaded, load from the languages directory
	if ( ! $loaded ) {
		$mofile = WP_LANG_DIR . '/plugins/' . $mofile;
		load_textdomain( $domain, $mofile );
	}

}

/**
 * Register UI for Shortcode
 *
 * @param  string $shortcode_tag
 * @param  array  $args
 * @return null
 */
function shortcode_ui_register_for_shortcode( $shortcode_tag, $args = array() ) {

	/**
	 * Filter the Shortcode UI options for all registered shortcodes.
	 *
	 * @since 0.6.0
	 *
	 * @param array $args           The configuration argument array specified in shortcode_ui_register_for_shortcode()
	 * @param string $shortcode_tag The shortcode base.
	 */
	$args = apply_filters( 'shortcode_ui_shortcode_args', $args, $shortcode_tag );

	/**
	 * Filter the Shortcode UI options for a specific registered shortcode.
	 *
	 * This dynamic filter uses the shortcode base and thus lets you hook on the options on a specific shortcode.
	 *
	 * @since 0.6.0
	 *
	 * @param array $args The configuration argument array specified in shortcode_ui_register_for_shortcode()
	 */
	$args = apply_filters( "shortcode_ui_shortcode_args_{$shortcode_tag}", $args );

	Shortcode_UI::get_instance()->register_shortcode_ui( $shortcode_tag, $args );
}

/**
 * Display an admin notice on activating the plugin if no shortcodes with UI are available.
 *
 * @return void
 */
function shortcode_ui_activation_notice() {
	update_option( 'shortcode_ui_activation_notice', true );
}

register_activation_hook( __FILE__, 'shortcode_ui_activation_notice' );

/**
 * Get register UI args by shortcode tag
 *
 * @param  string $shortcode_tag
 * @param  array  $args
 * @return null
 */
function shortcode_ui_get_register_shortcode( $shortcode_tag ) {
	return Shortcode_UI::get_instance()->get_shortcode( $shortcode_tag );
}

/**
 * Queue the shortcode UI scripts & templates manually
 */
function shortcode_ui_enqueue_assets() {
	Shortcode_UI::get_instance()->enqueue();
}
