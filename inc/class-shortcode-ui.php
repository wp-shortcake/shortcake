<?php

class Shortcode_UI {

	private $plugin_dir;
	private $plugin_url;

	private $shortcodes = array();

	private static $instance = null;

	public static function get_instance() {
        if ( null == self::$instance ) {
            self::$instance = new self;
        }
        return self::$instance;
    }

	function __construct() {

		$this->plugin_version = '0.1';
		$this->plugin_dir     = plugin_dir_path( dirname(  __FILE__ ) );
		$this->plugin_url     = plugin_dir_url( dirname( __FILE__ ) );

		add_action( 'media_buttons', array( $this, 'action_media_buttons' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		add_action( 'admin_footer-post.php', array( $this, 'print_templates' ) );
		add_action( 'admin_footer-post-new.php', array( $this, 'print_templates' ) );

		add_action( 'wp_ajax_do_shortcode', array( $this, 'do_shortcode' ) );

	}

	function register_shortcode_ui( $shortcode, $args = array() ) {

		$defaults = array(
			'label' => '',
			'attrs' => array(),
			'listItemImage'      => '',   // src or 'dashicons-' - used in insert list.
			'template-edit-form' => null, // Template used to render edit form
			'template-render'    => null, // Template used to render on front end
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
		$this->get_view( 'shortcode-default-edit-form' );

		// Load individual shortcode template files.
		foreach ( $this->shortcodes as $shortcode => $args ) {

			// Load shortcode edit form template.
			if ( ! empty( $args['template-edit-form'] ) ) {
				$this->get_view( $args['template-edit-form'] );
			}

		}

	}

	public function get_view( $template, $template_args = array(), $echo = true ) {

		if ( ! file_exists( $template ) ) {

			$template_dir  = $this->plugin_dir . 'inc/templates/';
			$template = $template_dir . $template . '.tpl.php';

			if ( ! file_exists( $template ) ) {
				return '';
			}

		}

		extract( $template_args, EXTR_SKIP );

		ob_start();
		include $template;

		if ( ! $echo ) {
			return ob_get_clean();
		}

		echo ob_get_clean();

	}

	function render_shortcode( $atts, $content = null, $tag ) {

		if ( ! array_key_exists( $tag, $this->shortcodes ) ) {
			return;
		}

		$shortcode_settings = $this->shortcodes[ $tag ];

		$args = array(
			'shortcode' => $tag,
			'content'   => $content,
			'attrs'     => $atts
		);

		$args = apply_filters( "shortcode_ui_render_atts_$shortcode", $args );

		if ( $shortcode_settings['template-render'] ) {
			return $this->get_view( $shortcode_settings['template-render'], $args, false );
		} else {
			return $this->get_view( 'shortcode-default-render', $args, false );
		}

	}

	function do_shortcode( ) {
		$shortcode = ! empty( $_POST['shortcode'] ) ? sanitize_text_field( wp_unslash( $_POST['shortcode'] ) ) : null;
		echo do_shortcode( $shortcode );
		exit;
	}

}