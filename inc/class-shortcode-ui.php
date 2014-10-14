<?php

class Shortcode_UI {

	private $plugin_dir;
	private $plugin_url;

	private $shortcodes = array();

	function __construct() {

		$this->plugin_version = '0.1';
		$this->plugin_dir     = plugin_dir_path( dirname(  __FILE__ ) );
		$this->plugin_url     = plugin_dir_url( dirname( __FILE__ ) );

		add_action( 'media_buttons', array( $this, 'action_media_buttons' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		add_action( 'admin_footer-post.php', array( $this, 'print_templates' ) );
		add_action( 'admin_footer-post-new.php', array( $this, 'print_templates' ) );

		add_filter( 'mce_external_plugins', array( $this, 'add_tinymce_plugin' ) );

	}

	function register_shortcode_ui( $shortcode, $args = array() ) {

		$defaults = array(
			'label' => '',
			'image' => '',
			'attrs' => array(),
			'templateEditForm' => null,
			'templateRender'   => null,
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

		add_shortcode( $shortcode, array( $this, 'render_shortcode' ) );

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

		$this->get_view( 'media-frame' );
		$this->get_view( 'list-item' );
		$this->get_view( 'edit-form-default' );

		// Load individual shortcode template files.
		foreach ( $this->shortcodes as $shortcode => $args ) {
			// Load shortcode edit form template.
			if ( ! empty( $args['templateEditForm'] ) ) {
				$this->get_view( 'shortcode-' . $shortcode . '-editForm' );
			}
		}

	}

	public function add_tinymce_plugin( $plugin_array ) {
		$plugin_array['shortcodeui'] = $this->plugin_url . '/js/shortcode-ui-tinyMCE-plugin.js';
		return $plugin_array;
	}

	public function get_view( $template, $template_args = array(), $echo = true ) {

 		$template_dir  = $this->plugin_dir . 'inc/templates/';
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

	function render_shortcode( $atts, $content = null, $shortcode ) {

		if ( ! array_key_exists( $shortcode, $this->shortcodes ) ) {
			return;
		}

		$args            = $this->shortcodes[ $shortcode ];
		$atts['content'] = $content;
		$atts            = apply_filters( "shortcode_ui_render_atts_$shortcode", $atts );

		if ( $args['templateRender'] ) {
			return $this->get_view( $args['templateRender'], $atts, false );
		}

	}

}