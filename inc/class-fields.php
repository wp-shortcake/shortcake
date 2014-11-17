<?php

class Shortcode_UI_Fields {

	private static $instance = null;

	// Default Field Settings.
	private $field_defaults = array(
		'template' => 'shortcode-ui-field-text',
		'view'     => 'editAttributeField',
	);

	// Field Settings.
	private $fields = array(
		'textarea' => array(
			'template' => 'shortcode-ui-field-textarea',
		),
		'url' => array(
			'template' => 'shortcode-ui-field-url',
		),
		'select' => array(
			'template' => 'shortcode-ui-field-select',
		),
		'checkbox' => array(
			'template' => 'shortcode-ui-field-checkbox',
		),
		'radio' => array(
			'template' => 'shortcode-ui-field-radio',
		),
		'email' => array(
			'template' => 'shortcode-ui-field-email',
		),
		'number' => array(
			'template' => 'shortcode-ui-field-number',
		),
		'date' => array(
			'template' => 'shortcode-ui-field-date',
		),
	);

	private $nonces      = array();
	private $post_fields = array();

	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
			self::$instance->init();
		}
		return self::$instance;
	}

	private function init() {

		$this->fields = apply_filters( 'shortcode_ui_fields', $this->fields );
		$this->fields = array_map( function( $args ) { return wp_parse_args( $args, $this->field_defaults ); }, $this->fields );

		add_action( 'wp_ajax_shortcode_ui_post_field', array( $this, 'action_wp_ajax_shortcode_ui_post_field' ) );
		add_action( 'admin_init', array( $this, 'admin_init_post_field' ), 100 );
		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ), 100 );

	}

	public function action_admin_enqueue_scripts() {
		wp_localize_script(
			'shortcode-ui',
			'shortcodeUIFieldData',
			array(
				'fields' => $this->fields,
				'nonces' => $this->nonces,
			)
		);
	}

	public function admin_init_post_field() {

		foreach ( Shortcode_UI::get_instance()->get_shortcodes() as $shortcode => $shortcode_args ) {
			foreach ( $shortcode_args['attrs'] as $attr ) {
				if ( 'post' === $attr['type'] ) {

					$this->post_fields[ $shortcode ][ $attr['attr'] ] = $attr['query'];

					$nonce_action = sprintf( 'shortcode_ui_%s, %s', $shortcode, $attr['attr'] );
					$this->nonces[ $shortcode . '_' . $attr['attr'] ] = wp_create_nonce( $nonce_action );

				}
			}
		}

	}

	public function action_wp_ajax_shortcode_ui_post_field() {

		$nonce     = isset( $_POST['nonce'] ) ? sanitize_text_field( $_POST['nonce'] ) : null;
		$shortcode = isset( $_POST['shortcode'] ) ? sanitize_text_field( $_POST['shortcode'] ) : null;
		$attr      = isset( $_POST['attr'] ) ? sanitize_text_field( $_POST['attr'] ) : null;

		if ( ! wp_verify_nonce( $nonce, sprintf( 'shortcode_ui_%s, %s', $shortcode, $field ) ) ) {
			wp_send_json_error();
		}

		if ( isset( $this->post_fields[ $shortcode ] ) && isset( $this->post_fields[ $shortcode ][ $field ] ) ) {

			$this->post_fields[ $shortcode ][ $field ]['fields'] = 'ids';
			$query = new WP_Query( $this->post_fields[ $shortcode ][ $field ] );

			$r = array();

			foreach ( $query->posts as $post_id ) {
				$r[ $post_id ] = get_the_title( $post_id );
			}

			wp_send_json_success( $r );

		}

	}

}