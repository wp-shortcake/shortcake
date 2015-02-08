<?php

namespace Fusion\Admin;

use WP_Query;

class Shortcake_Field_Post_Select {

	private static $instance = null;

	// All registered post fields.
	private $post_fields  = array();

	// Field Settings.
	private $fields = array(
		'post_select' => array(
			'template' => 'fusion-shortcake-field-post-select',
			'view'     => 'editAttributeFieldPostSelect',
		),
	);

	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	private function setup_actions() {

		add_filter( 'shortcode_ui_fields', array( $this, 'filter_shortcode_ui_fields' ) );

		add_action( 'admin_init', array( $this, 'action_init_post_field' ), 100 );
		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ), 100 );
		add_action( 'wp_ajax_shortcode_ui_post_field', array( $this, 'action_wp_ajax_shortcode_ui_post_field' ) );
		add_action( 'print_media_templates', array( $this, 'action_print_media_templates' ) );

	}

	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_admin_enqueue_scripts() {

		wp_enqueue_script(
			'shortcake-field-post-select',
			get_stylesheet_directory_uri() . '/assets/js/src/admin/shortcake/field-post-select.js',
			array( 'shortcake', 'select2' )
		);

		wp_enqueue_script( 'select2', get_template_directory_uri() . '/assets/vendor/select2/select2.min.js', array( 'jquery', 'jquery-ui-sortable' ), '3.5.2' );
		wp_enqueue_style( 'select2', get_template_directory_uri() . '/assets/vendor/select2/select2.css', array(), '3.5.2' );

		wp_localize_script( 'fusion-shortcake-field-post-select', 'shortcodeUIPostFieldData', $this->post_fields );

	}

	/**
	 * Initialize Post Fields.
	 *
	 * Find all registered shortcode attributes that use the post field and
	 * store an array with all their args for future reference.
	 *
	 * @return null
	 */
	public function action_init_post_field() {

		foreach ( \Shortcake::get_instance()->get_shortcodes() as $shortcode => $shortcode_args ) {
			foreach ( $shortcode_args['attrs'] as $attr ) {
				if ( 'post_select' === $attr['type'] ) {

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
	 * Output styles and templates used by post select field.
	 */
	public function action_print_media_templates() {

		?>

		<style>
			.edit-shortcode-form .select2-container {
				min-width: 300px;
			}
			.wp-admin .select2-drop {
				z-index: 160001;
			}
		</style>

		<script type="text/html" id="tmpl-fusion-shortcake-field-post-select">
			<p class="field-block">
				<label for="{{ data.attr }}">{{ data.label }}</label>
				<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" class="shortcake-post-select" />
			</p>
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

		if ( ! empty( $_GET['post__in'] ) ) {
			$post__in = is_array( $_GET['post__in'] ) ? $_GET['post__in'] : explode( ',', $_GET['post__in'] );
			$query_args['post__in'] = array_map( 'intval', $post__in );
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
