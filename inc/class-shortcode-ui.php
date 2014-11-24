<?php

class Shortcode_UI {

	private $plugin_dir;
	private $plugin_url;

	private $shortcodes = array();

	private static $instance = null;

	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
			self::$instance->setup_actions();
			self::$instance->setup_filters();
		}
		return self::$instance;
	}

	function __construct() {

		$this->plugin_version = '0.1';
		$this->plugin_dir     = plugin_dir_path( dirname(  __FILE__ ) );
		$this->plugin_url     = plugin_dir_url( dirname( __FILE__ ) );

	}

	private function setup_actions() {
		add_action( 'admin_init', function() {
			remove_action( 'media_buttons', 'media_buttons' );
		} );

		add_action( 'media_buttons',         array( $this, 'action_media_buttons' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ) );
		add_action( 'print_media_templates', array( $this, 'action_print_media_templates' ) );
		add_action( 'wp_ajax_do_shortcode',  array( $this, 'handle_ajax_do_shortcode' ) );
	}

	private function setup_filters() {
		add_filter( 'tiny_mce_before_init',  array( $this, 'modify_tiny_mce_4' ) );
	}

	public function register_shortcode_ui( $shortcode_tag, $args = array() ) {

		$defaults = array(
			'label'         => '',
			'attrs'         => array(),
			'listItemImage' => '',   // src or 'dashicons-' - used in insert list.
		);

		$args = wp_parse_args( $args, $defaults );

		// strip invalid
		foreach ( $args as $key => $value ) {
			if ( ! array_key_exists( $key, $defaults ) ) {
				unset( $args[ $key ] );
			}
		}

		$args['shortcode_tag'] = $shortcode_tag;
		$this->shortcodes[ $shortcode_tag ] = $args;

	}

	public function get_shortcode( $shortcode_tag ) {

		if ( isset( $this->shortcodes[ $shortcode_tag ] ) ) {
			return $this->shortcodes[ $shortcode_tag ];
		}

	}

	/**
	 * Replace the 'add media' button with a more generic button.
	 * This is slightly modified version of the core `media_buttons` function.
	 *
	 * @param  string $editor_id
	 * @return null
	 */
	public function action_media_buttons( $editor_id = 'content' ) {

		static $instance = 0;
		$instance++;

		$post = get_post();
		if ( ! $post && ! empty( $GLOBALS['post_ID'] ) )
			$post = $GLOBALS['post_ID'];

		wp_enqueue_media( array(
			'post' => $post,
		) );

		$img = '<span class="wp-media-buttons-icon"></span> ';

		$id_attribute = $instance === 1 ? ' id="insert-media-button"' : '';
		printf( '<a href="#"%s class="button insert-media add_media" data-editor="%s" title="%s">%s</a>',
			$id_attribute,
			esc_attr( $editor_id ),
			esc_attr__( 'Add Content', 'shortcode-ui' ),
			$img . esc_html__( 'Add Content', 'shortcode-ui' )
		);

	}

	public function action_admin_enqueue_scripts( $hook ) {

		if ( in_array( $hook, array( 'post.php', 'post-new.php' ) ) ) {

			wp_enqueue_script( 'shortcode-ui', $this->plugin_url . 'js/shortcode-ui.js', array( 'jquery', 'backbone', 'mce-view' ), $this->plugin_version );
			wp_enqueue_style( 'shortcode-ui', $this->plugin_url . 'css/shortcode-ui.css', array(), $this->plugin_version );
			wp_localize_script( 'shortcode-ui', ' shortcodeUIData', array(
				'shortcodes' => array_values( $this->shortcodes ),
				'previewNonce' => wp_create_nonce( 'shortcode-ui-preview' ),
				'modalOptions' => array(
    					'media_frame_title' => esc_html__( 'Insert Content Item', 'shortcode-ui' ),
				)
			) );

		}

	}

	/**
	 * Output required underscore.js templates
	 *
	 * @return null
	 */
	public function action_print_media_templates() {
		echo $this->get_view( 'media-frame' );
		echo $this->get_view( 'list-item' );
		echo $this->get_view( 'edit-form' );
	}

	/**
	 * Helper function for displaying a PHP template file.
	 * Template args array is extracted and passed to the template file.
	 *
	 * @param  string  $template      full template file path. Or name of template file in inc/templates.
	 * @param  array   $template_args array of args
	 * @return [type]                 [description]
	 */
	public function get_view( $template ) {

		if ( ! file_exists( $template ) ) {

			$template_dir  = $this->plugin_dir . 'inc/templates/';
			$template = $template_dir . $template . '.tpl.php';

			if ( ! file_exists( $template ) ) {
				return '';
			}

		}

		ob_start();
		include $template;

		return ob_get_clean();
	}

	/**
	 * Load custom editor style CSS.
	 *
	 * @param  array tinyMCE config
	 * @return array tinyMCE config
	 */
	public function modify_tiny_mce_4( $init ) {
		if ( ! isset( $init['content_css'] ) ) {
			$init['content_css'] = '';
		}
		$init['content_css'] .= ',' . $this->plugin_url . '/css/shortcode-ui-editor-styles.css';
		return $init;
	}

	/**
	 * Output a shortcode.
	 * ajax callback for displaying the shortcode in the TinyMCE editor.
	 *
	 * @return null
	 */
	public function handle_ajax_do_shortcode( ) {

		// Don't sanitize shortcodes — can contain HTML kses doesn't allow (e.g. sourcecode shortcode)
		$shortcode = ! empty( $_POST['shortcode'] ) ? stripslashes( $_POST['shortcode'] ) : null;
		$post_id   = ! empty( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : null;

		if ( ! current_user_can( 'edit_post', $post_id ) || ! wp_verify_nonce( $_POST['nonce'], 'shortcode-ui-preview' ) ) {
			echo esc_html__( "Something's rotten in the state of Denmark", 'shortcode-ui' );
			exit;
		}

		do_action( 'shortcode_ui_before_do_shortcode' );
		global $post;
		$post = get_post( $post_id );
		setup_postdata( $post );
		echo do_shortcode( $shortcode );
		do_action( 'shortcode_ui_after_do_shortcode' );
		exit;

	}

}
