<?php

class Shortcake_Field_Image {

	private static $instance = null;

	// All registered post fields.
	private $post_fields  = array();

	// Field Settings.
	private $fields = array(
		'image' => array(
			'template' => 'fusion-shortcake-field-image',
			'view'     => 'editAttributeFieldImage',
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
		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ), 100 );
		add_action( 'print_media_templates', array( $this, 'action_print_media_templates' ) );
		add_action( 'wp_ajax_shortcode_ui_get_image', array( $this, 'action_wp_ajax_get_image' ) );

	}

	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_admin_enqueue_scripts() {

		$script = plugins_url( '/js/field-image.js', dirname( dirname( __FILE__ ) ) );

		wp_enqueue_script( 'shortcake-field-image', $script, array( 'shortcode-ui' ) );

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
	}

	/**
	 * Output styles and templates used by post select field.
	 */
	public function action_print_media_templates() {

		?>

		<script type="text/html" id="tmpl-fusion-shortcake-field-image">
			<p class="field-block">
				<label for="{{ data.attr }}">{{ data.label }}</label>
				<div class="shortcake-image-field-preview">
				<button id="{{ data.attr }}" class="button button-small add">Select Image</button>
				<button id="{{ data.attr }}" class="button button-small remove">&times;</button>
				</div>
			</p>
		</script>

		<?php
	}

	public function action_wp_ajax_get_image() {

		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'shortcode-ui-get-thumbnail-image' ) ) {
			wp_send_json_error();
		}

		if ( $attachment = wp_prepare_attachment_for_js( absint( $_POST['id'] ) ) ) {
			wp_send_json_success( $attachment );
		} else {
			wp_send_json_error( 'Image not found' );
		}

	}
}
