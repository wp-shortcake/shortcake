<?php
/**
 * Plugin Name: Shortcode UI
 * Version: 0.1-beta
 * Description: Interface for adding shortcodes.
 * Author: Human Made Limited
 * Author URI: http://hmn.md
 *
 * License: GPLv2 or later
 *
 *	Copyright (C) 2013 Dominik Schilling
 *
 *	This program is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU General Public License
 *	as published by the Free Software Foundation; either version 2
 *	of the License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

class Shortcode_UI {

	private $plugin_dir;
	private $plugin_url;

	private $shortcodes = array();


	function __construct() {

		$this->plugin_version = '0.1';
		$this->plugin_dir     = plugin_dir_path( __FILE__ );
		$this->plugin_url     = plugin_dir_url( __FILE__ );

		add_action( 'media_buttons', array( $this, 'action_media_buttons' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		add_action( 'admin_footer-post.php', array( $this, 'print_templates' ) );
		add_action( 'admin_footer-post-new.php', array( $this, 'print_templates' ) );

		add_filter( 'mce_external_plugins', array( $this, 'add_tinymce_plugin' ) );

	}

	function register_shortcode_ui( $shortcode, $args = array() ) {

		$defaults = array(
			'label'              => '',
			'image'              => '',
			'shortcodeAtts'      => array(),
		);

		// Parse args.
		$args = wp_parse_args( $args, $defaults );

		// strip invalid
		foreach ( $args as $key => $value ) {
			if ( ! array_key_exists( $key, $defaults ) ) {
				unset( $args[ $key ] );
			}
		}

		$args['shortcode'] = $shortcode;

		$this->shortcodes[ $shortcode ] = $args;

	}

	public function action_media_buttons() {

		$post = get_post();

		if ( ! $post && ! empty( $GLOBALS['post_ID'] ) )
			$post = $GLOBALS['post_ID'];

		$img = '<span class="wp-media-buttons-icon"></span> ';

		printf(
			'<button class="%s" title="%s">%s</button>',
			'button shortcode-editor-open-insert-modal add_media',
			esc_attr__( 'Add Shortcode', 'shortcode-ui' ),
			$img . __( 'Add Shortcode', 'shortcode-ui' )
		);

	}

	function enqueue_scripts( $hook ) {

    	if ( in_array( $hook, array( 'post.php', 'post-new.php' ) ) ) {

    		wp_enqueue_script( 'shortcode-ui', $this->plugin_url . 'js/shortcode-ui.js', array( 'jquery', 'backbone' ), $this->plugin_version );
    		wp_enqueue_style( 'shortcode-ui', $this->plugin_url . 'css/shortcode-ui.css', array(), $this->plugin_version );

    		wp_localize_script( 'shortcode-ui', ' shortcodeUIData', array(
    			'shortcodes' => array_values( $this->shortcodes ),
    			'modalOptions' => array(
    				'media_frame_title' => 'Insert Shortcode',
					'insert_into_button_label' => 'Button',
					'media_toolbar_secondary_button_label' => 'Secondary Button',
					'default_title' => 'Default Title',
				)
    		) );

    	}

	}

	public function print_templates() {
		$this->get_view( 'media-frame', array() );
		$this->get_view( 'add-shortcode-list-item', array() );
		$this->get_view( 'edit-shortcode-content-default', array() );
	}

	public function add_tinymce_plugin( $plugin_array ) {
		$plugin_array['shortcodeui'] = $this->plugin_url . '/js/shortcode-ui-tinyMCE-plugin.js';
		return $plugin_array;
	}

	public function get_view( $template, $template_args = array(), $echo = true ) {

 		$template_dir  = $this->plugin_dir . '/inc/templates/';
		$template_file = $template_dir . $template . '.tpl.php';

		if ( ! file_exists( $template_file ) ) {
			return '';
		}

		extract( $template_args, EXTR_SKIP );
		ob_start();
		include $template_file;

		if ( ! $echo ) {
			return ob_get_clean();
		}

		echo ob_get_clean();

	}

}

add_action( 'init', function() {

	$instance = new Shortcode_UI();

	$args = array(
		'label' => 'Test Shortcode',
		'image' => 'dashicons-carrot',
		'shortcodeAtts' => array(
			array( 'label' => 'ID', 'id' => 'id' ),
			array( 'label' => 'Align', 'id' => 'align', 'value' => 'left' ),
		)
	);

	$instance->register_shortcode_ui( 'test_shortcode', $args );

	$args = array(
		'label' => 'Blockquote',
		'image' => 'dashicons-editor-quote',
		'shortcodeAtts' => array(
			array( 'label' => 'Background Color', 'id' => 'bg_color' ),
			array( 'label' => 'Align', 'id' => 'align', 'value' => 'left' ),
			array( 'label' => 'Font Size', 'id' => 'font-size', 'value' => 'large' ),
		)
	);

	$instance->register_shortcode_ui( 'blockquote', $args );


} );