<?php

class Shortcake_Field_Attachment {

	private static $instance;

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
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	private function setup_actions() {

		add_filter( 'shortcode_ui_fields', array( $this, 'filter_shortcode_ui_fields' ) );
		add_action( 'enqueue_shortcode_ui', array( $this, 'action_enqueue_shortcode_ui' ) );
		add_action( 'shortcode_ui_loaded_editor', array( $this, 'action_shortcode_ui_loaded_editor' ) );

	}

	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_enqueue_shortcode_ui() {

		$script = plugins_url( 'js/build/field-attachment.js', dirname( dirname( __FILE__ ) ) );

		wp_enqueue_script( 'shortcake-field-attachment', $script, array( 'shortcode-ui' ) );

		wp_localize_script( 'shortcake-field-attachment', 'ShortcakeImageFieldData', array(
			'defaultArgs' => array(
				'libraryType' => null, // array of mime types. eg image, image/jpg, application, application/pdf.
				'addButton'   => __( 'Select Attachment', 'shortcode-ui' ),
				'frameTitle'  => __( 'Select Attachment', 'shortcode-ui' ),
			),
		) );
	}

	/**
	 * Output templates used by post select field.
	 */
	public function action_shortcode_ui_loaded_editor() {

		?>

		<script type="text/html" id="tmpl-fusion-shortcake-field-attachment">
			<div class="field-block">
				<label for="{{ data.attr }}">{{ data.label }}</label>
				<div class="shortcake-attachment-preview attachment-preview attachment">
					<button id="{{ data.attr }}" class="button button-small add">{{ data.addButton }}</button>
					<button class="button button-small remove">&times;</button>
					<span class="loading-indicator spinner"></span>
				</div>
			</div>
		</script>

		<?php
	}

}
