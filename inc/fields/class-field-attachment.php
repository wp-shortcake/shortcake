<?php

class Shortcake_Field_Attachment {

	private static $instance = null;

	// All registered post fields.
	private $post_fields  = array();

	// Field Settings.
	private $fields = array(
		'attachment' => array(
			'template' => 'fusion-shortcake-field-attachment',
			'view'     => 'editAttributeFieldAttachment',
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

	}

	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_admin_enqueue_scripts() {

		$script = plugins_url( '/js/field-attachment.js', dirname( dirname( __FILE__ ) ) );

		wp_enqueue_script( 'shortcake-field-attachment', $script, array( 'shortcode-ui' ) );

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

		<script type="text/html" id="tmpl-fusion-shortcake-field-attachment">
			<div class="field-block">
				<label for="{{ data.attr }}">{{ data.label }}</label>
				<div class="shortcake-attachment-preview attachment-preview attachment">
					<button id="{{ data.attr }}" class="button button-small add">Select Attachment</button>
					<button class="button button-small remove">&times;</button>
				</div>
			</div>
		</script>

		<?php
	}

}
