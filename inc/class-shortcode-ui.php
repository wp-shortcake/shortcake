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

		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'print_media_templates', array( $this, 'print_templates' ) );
		add_action( 'wp_ajax_do_shortcode', array( $this, 'do_shortcode' ) );

	}

	function register_shortcode_ui( $shortcode_tag, $args = array() ) {

		$defaults = array(
			'label'         => '',
			'attrs'         => array(),
			'listItemImage' => '',   // src or 'dashicons-' - used in insert list.
		);

		$args = wp_parse_args( $args, $defaults );

		// Strip invalid args.
		foreach ( $args as $key => $value ) {
			if ( ! array_key_exists( $key, $defaults ) ) {
				unset( $args[ $key ] );
			}
		}

		$args['shortcode_tag'] = $shortcode_tag;
		$this->shortcodes[ $shortcode_tag ] = $args;

	}

	function get_shortcode( $shortcode_tag ) {

		if ( isset( $this->shortcodes[ $shortcode_tag ] ) ) {
			return $this->shortcodes[ $shortcode_tag ];
		}

	}

	public function action_media_buttons() {

		$post = get_post();

		if ( ! $post && ! empty( $GLOBALS['post_ID'] ) )
			$post = $GLOBALS['post_ID'];

		$img = '<span class="wp-media-buttons-icon"></span> ';

		printf(
			'<button class="%s" title="%s">%s</button>',
			'button shortcode-editor-open-insert-modal add_media',
			esc_attr__( 'Add Content Item', 'shortcode-ui' ),
			$img . __( 'Add Content Item', 'shortcode-ui' )
		);

	}

	function enqueue_scripts( $hook ) {

		if ( in_array( $hook, array( 'post.php', 'post-new.php' ) ) ) {

			wp_enqueue_script( 'shortcode-ui', $this->plugin_url . 'js/shortcode-ui.js', array( 'jquery', 'backbone', 'mce-view' ), $this->plugin_version );
			wp_enqueue_style( 'shortcode-ui', $this->plugin_url . 'css/shortcode-ui.css', array(), $this->plugin_version );

			wp_localize_script( 'shortcode-ui', ' shortcodeUIData', array(
				'shortcodes' => array_values( $this->shortcodes ),
				'modalOptions' => array(
					'media_frame_title' => 'Insert Content Item',
				)
			) );

		}

	}

	public function print_templates() {

		$this->get_view( 'media-frame' );
		$this->get_view( 'list-item' );
		$this->get_view( 'shortcode-default-edit-form' );
		$this->get_view( 'default-shortcode-render' );

		// Load individual shortcode template files.
		foreach ( $this->shortcodes as $shortcode => $args ) {

			// Load shortcode edit form template.
			if ( ! empty( $args['template-edit-form'] ) ) {
				$this->get_view( $args['template-edit-form'] );
			}

		}

	}

	/**
	 * Helper function for displaying a PHP template file.
	 * Template args array is extracted and passed to the template file.
	 *
	 * @param  string  $template      full template file path. Or name of template file in inc/templates.
	 * @param  array   $template_args array of args
	 * @param  boolean $echo          [description]
	 * @return [type]                 [description]
	 */
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

	function do_shortcode( ) {

		$shortcode = ! empty( $_POST['shortcode'] ) ? sanitize_text_field( wp_unslash( $_POST['shortcode'] ) ) : null;
		$post_id   = ! empty( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : null;

		global $post;
		$post = get_post( $post_id );
		setup_postdata( $post );

		echo do_shortcode( $shortcode );
		exit;
	}

}