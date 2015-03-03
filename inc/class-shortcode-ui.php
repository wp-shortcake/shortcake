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
		}

		return self::$instance;
	}

	function __construct() {

		$this->plugin_version = '0.1';
		$this->plugin_dir     = plugin_dir_path( dirname( __FILE__ ) );
		$this->plugin_url     = plugin_dir_url( dirname( __FILE__ ) );

	}

	private function setup_actions() {
		$this->add_editor_style();
		add_action( 'wp_enqueue_editor',    array( $this, 'action_wp_enqueue_editor' ) );
		add_action( 'wp_ajax_do_shortcode', array( $this, 'handle_ajax_do_shortcode' ) );
	}

	public function register_shortcode_ui( $shortcode_tag, $args = array() ) {

		$defaults = array(
			'label'         => '',
			'attrs'         => array(),
			'listItemImage' => '',   // src or 'dashicons-' - used in insert list.
			'inner_content' => false,
		);

		$args = wp_parse_args( $args, $defaults );


		// inner_content=true is a valid argument, but we want more detail
		if ( is_bool( $args['inner_content'] ) && true === $args['inner_content'] ) {
			$args['inner_content'] = array(
				'label'       => esc_html__( 'Inner Content', 'shortcode-ui' ),
				'description' => '',
				'placeholder' => '',
			);
		}

		//following code is for backward compatibility
		//which will be removed in the next version. (to supports 'attr' => 'content' special case) 
		$num_attrs = count( $args['attrs'] );
		for ( $i = 0; $i < $num_attrs; $i++ ) {
			if ( ! isset( $args['attrs'][ $i ]['attr'] ) || $args['attrs'][ $i ]['attr'] !== 'content' ) {
				continue;
			}

			$args['inner_content'] = array();
			foreach ( $args['attrs'][ $i ] as $key => $value ) {
				if ( $key == 'attr' ) {
					continue;
				}
				$args['inner_content'][ $key ] = $value;
			}

			$index = $i;
		}
		if ( isset( $index ) ) {
			array_splice( $args['attrs'], $index, 1 );
		}

		// strip invalid
		foreach ( $args as $key => $value ) {
			if ( ! array_key_exists( $key, $defaults ) ) {
				unset( $args[ $key ] );
			}
		}

		$args['shortcode_tag'] = $shortcode_tag;
		$this->shortcodes[ $shortcode_tag ] = $args;

	}

	public function get_shortcodes() {
		return $this->shortcodes;
	}

	public function get_shortcode( $shortcode_tag ) {

		if ( isset( $this->shortcodes[ $shortcode_tag ] ) ) {
			return $this->shortcodes[ $shortcode_tag ];
		}

	}

	public function add_editor_style() {
		add_editor_style( $this->plugin_url . '/css/shortcode-ui-editor-styles.css' );
	}

	public function enqueue() {

		if ( did_action( 'enqueue_shortcode_ui' ) ) {
			return;
		}

		// make sure media library is queued
		wp_enqueue_media();

		$shortcodes = array_values( $this->shortcodes );
		usort( $shortcodes, array( $this, 'compare_shortcodes_by_label' ) );

		wp_enqueue_script( 'shortcode-ui', $this->plugin_url . 'js/build/shortcode-ui.js', array( 'jquery', 'backbone', 'mce-view' ), $this->plugin_version );
		wp_enqueue_style( 'shortcode-ui', $this->plugin_url . 'css/shortcode-ui.css', array(), $this->plugin_version );
		wp_localize_script( 'shortcode-ui', ' shortcodeUIData', array(
			'shortcodes' => $shortcodes,
			'strings'    => array(
				'media_frame_title'                => esc_html__( 'Insert Post Element', 'shortcode-ui' ),
				'media_frame_menu_insert_label'    => esc_html__( 'Insert Post Element', 'shortcode-ui' ),
				'media_frame_menu_update_label'    => esc_html__( 'Post Element Details', 'shortcode-ui' ),
				'media_frame_toolbar_insert_label' => esc_html__( 'Insert Element', 'shortcode-ui' ),
				'media_frame_toolbar_update_label' => esc_html__( 'Update', 'shortcode-ui' ),
				'edit_tab_label'                   => esc_html__( 'Edit', 'shortcode-ui' ),
				'preview_tab_label'                => esc_html__( 'Preview', 'shortcode-ui' ),
				'mce_view_error'                   => esc_html__( 'Failed to load preview', 'shortcode-ui' ),
			),
			'nonces'     => array(
				'preview'        => wp_create_nonce( 'shortcode-ui-preview' ),
				'thumbnailImage' => wp_create_nonce( 'shortcode-ui-get-thumbnail-image' ),
			)
		) );

		// queue templates
		add_action( 'admin_print_footer_scripts', array( $this, 'action_print_media_templates' ) );

		do_action( 'enqueue_shortcode_ui' );
	}

	/**
	 * Default hook to queue shortcake from
	 */
	public function action_wp_enqueue_editor() {
		// queue scripts & templates
		$this->enqueue();

		do_action( 'shortcode_ui_loaded_editor' );
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

		do_action( 'print_shortcode_ui_templates' );
	}

	/**
	 * Helper function for displaying a PHP template file.
	 * Template args array is extracted and passed to the template file.
	 *
	 * @param  string $template full template file path. Or name of template file in inc/templates.
	 * @return string                 the template contents
	 */
	public function get_view( $template ) {

		if ( ! file_exists( $template ) ) {

			$template_dir = $this->plugin_dir . 'inc/templates/';
			$template     = $template_dir . $template . '.tpl.php';

			if ( ! file_exists( $template ) ) {
				return '';
			}

		}

		ob_start();
		include $template;

		return ob_get_clean();
	}

	/**
	 * Compare shortcodes by label
	 *
	 * @param array $a
	 * @param array $b
	 * @return int
	 */
	private function compare_shortcodes_by_label( $a, $b ) {
		return strcmp( $a['label'], $b['label'] );
	}

	/**
	 * Output a shortcode.
	 * ajax callback for displaying the shortcode in the TinyMCE editor.
	 *
	 * @return null
	 */
	public function handle_ajax_do_shortcode() {

		// Don't sanitize shortcodes — can contain HTML kses doesn't allow (e.g. sourcecode shortcode)
		$shortcode = ! empty( $_POST['shortcode'] ) ? stripslashes( $_POST['shortcode'] ) : null;
		$post_id   = ! empty( $_POST['post_id'] ) ? intval( $_POST['post_id'] ) : null;

		if ( ! current_user_can( 'edit_post', $post_id ) || ! wp_verify_nonce( $_POST['nonce'], 'shortcode-ui-preview' ) ) {
			echo esc_html__( "Something's rotten in the state of Denmark", 'shortcode-ui' );
			exit;
		}

		if ( ! empty( $post_id ) ) {
			global $post;
			$post = get_post( $post_id );
			setup_postdata( $post );
		}

		ob_start();
		do_action( 'shortcode_ui_before_do_shortcode', $shortcode );
		echo do_shortcode( $shortcode );
		do_action( 'shortcode_ui_after_do_shortcode', $shortcode );

		wp_send_json_success( ob_get_clean() );

	}

}
