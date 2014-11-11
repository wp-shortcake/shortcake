<?php


class Shortcode_UI_Fieldmanager_Fields {

	static $instance;

	private $fields = array(
		'Fieldmanager_Textfield',
		'Fieldmanager_TextArea',
		'Fieldmanager_Media'
	);

	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	function setup_actions() {
		$this->init();
		add_action( 'wp_ajax_shortcode_ui_get_thumbnail_image', array( $this, 'ajax_get_thumbnail_image' ) );
	}

	function init() {

		foreach ( $this->fields as $field_class ) {

			$field = new $field_class( '{{ data.label }}', array( 'name' => '{{ data.attr }}' ) );

			add_action( 'print_media_templates', function() use ( $field_class, $field ) {

				printf(
					'<script type="text/html" id="tmpl-shortcode-ui-field-%s">',
					$field_class
				);

				echo $field->element_markup( '{{ data.value }}' );
				echo "</script>\r";

			} );

		}

	}

	function ajax_get_thumbnail_image() {

		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'shortcode-ui-get-thumbnail-image' ) ) {
			wp_send_json_error();
		}

		$id    = intval( $_POST['id'] );
		$size  = sanitize_text_field( $_POST['size'] );
		$image = wp_get_attachment_image_src( $id, $size );

		if ( ! $image ) {
			wp_send_json_error();
		}

		wp_send_json_success( array(
			'src'    => $image[0],
			'width'  => $image[1],
			'height' => $image[2],
			'html'   => wp_get_attachment_image( $id, $size ),
		) );

	}

}
