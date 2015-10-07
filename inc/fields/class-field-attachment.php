<?php

/**
 * Primary controller class for Shortcake Attachment Field
 */
class Shortcake_Field_Attachment {

	/**
	 * Shortcake Attachment Field controller instance.
	 *
	 * @access private
	 * @var object
	 */
	private static $instance;

	/**
	 * All registered post fields.
	 *
	 * @access private
	 * @var array
	 */
	private $post_fields  = array();

	/**
	 * Settings for the Attachment Field.
	 *
	 * @access private
	 * @var array
	 */
	private $fields = array(
		'attachment' => array(
			'template' => 'fusion-shortcake-field-attachment',
			'view'     => 'editAttributeFieldAttachment',
		),
	);

	/**
	 * Get instance of Shortcake Attachment Field controller.
	 *
	 * Instantiates object on the fly when not already loaded.
	 *
	 * @return object
	 */
	public static function get_instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	/**
	 * Set up actions needed for Attachment Field
	 */
	private function setup_actions() {
		add_filter( 'shortcode_ui_fields', array( $this, 'filter_shortcode_ui_fields' ) );
		add_action( 'enqueue_shortcode_ui', array( $this, 'action_enqueue_shortcode_ui' ) );
		add_action( 'shortcode_ui_loaded_editor', array( $this, 'action_shortcode_ui_loaded_editor' ) );
	}

	/**
	 * Add Attachment Field settings to Shortcake fields
	 *
	 * @param array $fields
	 * @return array
	 */
	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	/**
	 * Add localization data needed for Shortcake Attachment Field
	 */
	public function action_enqueue_shortcode_ui() {

		wp_localize_script( 'shortcode-ui', 'ShortcakeImageFieldData', array(
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
			<div class="field-block shortcode-ui-field-attachment shortcode-ui-attribute-{{ data.attr }}">
				<label for="{{ data.attr }}">{{{ data.label }}}</label>
				<div class="shortcake-attachment-preview attachment-preview attachment">
					<button id="{{ data.attr }}" class="button button-small add">{{ data.addButton }}</button>
					<button class="button button-small remove">&times;</button>
					<div class="loading-indicator">
						<span class="dashicons dashicons-format-image"></span>
						<div class="attachment-preview-loading"><ins></ins></div>
					</div>
				</div>
				<div class="thumbnail-details-container">
					<strong><?php esc_html_e( 'Thumbnail Details', 'shortcode-ui' ); ?></strong>
					<div class="filename"></div>
					<div class="date-formatted"></div>
					<div class="size"></div>
					<div class="dimensions"></div>
					<div class="edit-link"><a href="#"><?php esc_html_e( 'Edit Attachment', 'shortcode-ui' ); ?></a></div>
				</div>
				<# if ( typeof data.description == 'string' ) { #>
					<p class="description">{{{ data.description }}}</p>
				<# } #>
			</div>
		</script>

		<?php
	}

}
