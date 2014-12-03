<?php

class Shortcode_UI_Field_Post_Select {

	private static $instance = null;

	// plugin directory path and URL.
	private $plugin_dir;
	private $plugin_url;

	// All registered post fields.
	private $post_fields  = array();

	// Field Settings.
	private $fields = array(
		'post_select2' => array(
			'template' => 'shortcode-ui-field-post-select2',
			'view'     => 'editAttributeFieldPostSelect2',
		),
	);

	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	function __construct() {
		$this->plugin_dir     = plugin_dir_path( dirname( dirname(  __FILE__ ) ) );
		$this->plugin_url     = plugin_dir_url( dirname( dirname( __FILE__ ) ) );
	}

	private function setup_actions() {

		add_filter( 'shortcode_ui_fields', array( $this, 'add_field' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ), 100 );

		// Post Select 2 field actions.
		add_action( 'wp_ajax_shortcode_ui_post_field', array( $this, 'action_wp_ajax_shortcode_ui_post_field' ) );
		add_action( 'wp_ajax_shortcode_ui_post_field_init_values', array( $this, 'action_wp_ajax_shortcode_ui_post_field_init_values' ) );
		add_action( 'admin_init', array( $this, 'admin_init_post_field' ), 100 );

	}

	public function add_field( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_admin_enqueue_scripts() {

		wp_enqueue_script(
			'shortcode-ui-field-post-select',
			$this->plugin_url . '/js/field-post-select.js',
			array( 'shortcode-ui', 'shortcode-ui' )
		);

		wp_enqueue_script( 'shortcode-ui-select2', $this->plugin_url . '/js/lib/select2/select2.min.js' );
		wp_enqueue_style(  'shortcode-ui-select2', $this->plugin_url . '/js/lib/select2/select2.css' );

		wp_localize_script( 'shortcode-ui-field-post-select', 'shortcodeUIPostFieldData', $this->post_fields );

	}

	/**
	 * Initialize Post Fields.
	 *
	 * Find all registered shortcode attributes that use the post field and
	 * store an array with all their args for future reference.
	 *
	 * @return null
	 */
	public function admin_init_post_field() {

		foreach ( Shortcode_UI::get_instance()->get_shortcodes() as $shortcode => $shortcode_args ) {
			foreach ( $shortcode_args['attrs'] as $attr ) {
				if ( 'post_select2' === $attr['type'] ) {

					$nonce_action = sprintf( 'shortcode_ui_%s, %s', $shortcode, $attr['attr'] );

					$this->post_fields[ $shortcode ][ $attr['attr'] ] = array(
						'query' => $attr['query'],
						'nonce' => wp_create_nonce( $nonce_action ),
					);

				}
			}
		}

	}

	/**
	 * Ajax handler for select2 post field queries.
	 * Output JSON containing post data.
	 * Requires that shortcode, attr and nonce are passed.
	 * Requires that the field has been correctly registred and can be found in $this->post_fields
	 * Supports passing page number and search query string.
	 *
	 * @return null
	 */
	public function action_wp_ajax_shortcode_ui_post_field() {

		$nonce     = isset( $_GET['nonce'] ) ? sanitize_text_field( $_GET['nonce'] ) : null;
		$shortcode = isset( $_GET['shortcode'] ) ? sanitize_text_field( $_GET['shortcode'] ) : null;
		$field     = isset( $_GET['attr'] ) ? sanitize_text_field( $_GET['attr'] ) : null;
		$response  = array( 'posts' => array(), 'found_posts'=> 0, 'posts_per_page' => 0 );

		if ( ! wp_verify_nonce( $nonce, sprintf( 'shortcode_ui_%s, %s', $shortcode, $field ) ) ) {
			wp_send_json_error( $response );
		}

		if ( ! ( isset( $this->post_fields[ $shortcode ] ) && isset( $this->post_fields[ $shortcode ][ $field ] ) ) ) {
			wp_send_json_error( $response );
		}

		// Get the query specified when registering this field.
		$query_args = $this->post_fields[ $shortcode ][ $field ]['query'];
		$query_args['fields'] = 'ids';

		if ( isset( $_GET['page'] ) ) {
			$query_args['paged'] = sanitize_text_field( $_GET['page'] );
		}

		if ( ! empty( $_GET['s'] ) ) {
			$query_args['s'] = sanitize_text_field( $_GET['s'] );
		}

		$query = new WP_Query( $query_args );

		foreach ( $query->posts as $post_id ) {
			array_push( $response['posts'], array( 'id' => $post_id, 'text' => html_entity_decode( get_the_title( $post_id ) ) ) );
		}

		$response['found_posts']    = $query->found_posts;
		$response['posts_per_page'] = $query->query_vars['posts_per_page'];

		wp_send_json_success( $response );

	}

	/**
	 * AJAX handler for initializing select2 fields.
	 * Parses comma separated list of IDs and returns formatted JSON for initializing the field.
	 *
	 * @return null
	 */
	public function action_wp_ajax_shortcode_ui_post_field_init_values() {

		$value     = isset( $_GET['value'] ) ? sanitize_text_field( $_GET['value'] ) : null;
		$nonce     = isset( $_GET['nonce'] ) ? sanitize_text_field( $_GET['nonce'] ) : null;
		$shortcode = isset( $_GET['shortcode'] ) ? sanitize_text_field( $_GET['shortcode'] ) : null;
		$field     = isset( $_GET['attr'] ) ? sanitize_text_field( $_GET['attr'] ) : null;
		$response  = array( 'posts' => array() );

		if ( empty( $value ) ) {
			wp_send_json_error( $response );
		}

		if ( ! wp_verify_nonce( $nonce, sprintf( 'shortcode_ui_%s, %s', $shortcode, $field ) ) ) {
			wp_send_json_error( $response );
		}

		$value = array_map( 'absint', array_filter( explode( ',', $value ) ) );

		foreach ( $value as $post_id ) {
			array_push( $response['posts'], array( 'id' => $post_id, 'text' => html_entity_decode( get_the_title( $post_id ) ) ) );
		}

		wp_send_json_success( $response );

	}


}
