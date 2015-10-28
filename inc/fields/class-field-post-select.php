<?php

class Shortcode_UI_Field_Post_Select {

	private static $instance;

	// All registered post fields.
	private $post_fields  = array();

	// Field Settings.
	private $fields = array(
		'post_select' => array(
			'template' => 'shortcode-ui-field-post-select',
			'view'     => 'editAttributeFieldPostSelect',
		),
	);

	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	private function setup_actions() {

		add_filter( 'shortcode_ui_fields', array( $this, 'filter_shortcode_ui_fields' ) );
		add_action( 'enqueue_shortcode_ui', array( $this, 'action_enqueue_shortcode_ui' ) );
		add_action( 'wp_ajax_shortcode_ui_post_field', array( $this, 'action_wp_ajax_shortcode_ui_post_field' ) );
		add_action( 'shortcode_ui_loaded_editor', array( $this, 'action_shortcode_ui_loaded_editor' ) );

	}

	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_enqueue_shortcode_ui() {

		$plugin_dir = dirname( dirname( __FILE__ ) );

		wp_enqueue_script( 'select2', plugins_url( 'lib/select2/select2.min.js', $plugin_dir ) , array( 'jquery', 'jquery-ui-sortable' ), '3.5.2' );
		wp_enqueue_style( 'select2', plugins_url( 'lib/select2/select2.css', $plugin_dir ), null, '3.5.2' );

		wp_localize_script( 'shortcode-ui', 'shortcodeUiPostFieldData', array(
			'nonce' => wp_create_nonce( 'shortcode_ui_field_post_select' ),
		) );

	}

	/**
	 * Output styles and templates used by post select field.
	 */
	public function action_shortcode_ui_loaded_editor() {

		?>

		<style>

			.edit-shortcode-form .select2-container {
				min-width: 300px;
			}

			.edit-shortcode-form .select2-container a {
				transition: none;
				-webkit-transition: none;
			}

			.wp-admin .select2-drop {
				z-index: 160001;
			}

		</style>

		<script type="text/html" id="tmpl-shortcode-ui-field-post-select">
			<div class="field-block shortcode-ui-field-post-select shortcode-ui-attribute-{{ data.attr }}">
				<label for="{{ data.id }}">{{{ data.label }}}</label>
				<input type="text" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" class="shortcode-ui-post-select" />
				<# if ( typeof data.description == 'string' ) { #>
					<p class="description">{{{ data.description }}}</p>
				<# } #>
			</div>
		</script>

		<?php
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

		$nonce               = isset( $_GET['nonce'] ) ? sanitize_text_field( $_GET['nonce'] ) : null;
		$requested_shortcode = isset( $_GET['shortcode'] ) ? sanitize_text_field( $_GET['shortcode'] ) : null;
		$requested_attr      = isset( $_GET['attr'] ) ? sanitize_text_field( $_GET['attr'] ) : null;
		$response            = array( 'posts' => array(), 'found_posts' => 0, 'posts_per_page' => 0 );

		$shortcodes = Shortcode_UI::get_instance()->get_shortcodes();

		if ( ! wp_verify_nonce( $nonce, 'shortcode_ui_field_post_select' ) ) {
			wp_send_json_error( $response );
		}

		// Shortcode not found.
		if ( ! isset( $shortcodes[ $requested_shortcode ] ) ) {
			wp_send_json_error( $response );
		}

		$shortcode = $shortcodes[ $requested_shortcode ];

		foreach ( $shortcode['attrs'] as $attr ) {
			if ( $attr['attr'] === $requested_attr && isset( $attr['query'] ) ) {
				$query_args = $attr['query'];
			}
		}

		// Query not found.
		if ( empty( $query_args ) ) {
			wp_send_json_error( $response );
		}

		// Hardcoded query args.
		$query_args['fields'] = 'ids';
		$query_args['perm']   = 'readable';

		if ( isset( $_GET['page'] ) ) {
			$query_args['paged'] = sanitize_text_field( $_GET['page'] );
		}

		if ( ! empty( $_GET['s'] ) ) {
			$query_args['s'] = sanitize_text_field( $_GET['s'] );
		}

		if ( ! empty( $_GET['post__in'] ) ) {
			$post__in = is_array( $_GET['post__in'] ) ? $_GET['post__in'] : explode( ',', $_GET['post__in'] );
			$query_args['post__in'] = array_map( 'intval', $post__in );
			$query_args['orderby']  = 'post__in';
			$query_args['ignore_sticky_posts'] = true;
		}

		$query = new WP_Query( $query_args );

		foreach ( $query->posts as $post_id ) {
			array_push( $response['posts'], array( 'id' => $post_id, 'text' => html_entity_decode( get_the_title( $post_id ) ) ) );
		}

		$response['found_posts']    = $query->found_posts;
		$response['posts_per_page'] = $query->query_vars['posts_per_page'];

		wp_send_json_success( $response );

	}

}
