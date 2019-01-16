<?php

/**
 * Primary controller class for Shortcode UI Attachment Field
 */
class Shortcode_UI_Field_Attachment {

	/**
	 * Shortcode UI Attachment Field controller instance.
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
	private $post_fields = array();

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
	 * Get instance of Shortcode UI Attachment Field controller.
	 *
	 * Instantiates object on the fly when not already loaded.
	 *
	 * @return Shortcode_UI_Field_Attachment
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
	 * Add localization data needed for Shortcode UI Attachment Field
	 */
	public function action_enqueue_shortcode_ui() {

		wp_localize_script(
			'shortcode-ui', 'ShortcakeImageFieldData', array(
				'defaultArgs' => array(
					'libraryType' => null, // array of mime types. eg image, image/jpg, application, application/pdf.
					'addButton'   => __( 'Select Attachment', 'shortcode-ui' ),
					'frameTitle'  => __( 'Select Attachment', 'shortcode-ui' ),
				),
			)
		);
	}

	/**
	 * Prepare to output the templates required for this field in the footer.
	 */
	public function action_shortcode_ui_loaded_editor() {
		add_action( 'admin_print_footer_scripts', array( $this, 'output_templates' ) );
	}

	/**
	 * Output templates used by attachment field.
	 */
	public function output_templates() {
		?>

		<script type="text/html" id="tmpl-fusion-shortcake-field-attachment">
			<div class="field-block shortcode-ui-field-attachment shortcode-ui-attribute-{{ data.attr }}">
				<label for="{{ data.attr }}">{{{ data.label }}}</label>
				<# if ( typeof data.description == 'string' ) { #>
					<p class="description">{{{ data.description }}}</p>
				<# } #>
				<button id="{{ data.attr }}" class="shortcake-attachment-select button button-small add">{{ data.addButton }}</button>
				<div class="attachment-previews"></div>
			</div>
		</script>

		<script type="text/html" id="tmpl-shortcake-image-preview">
			<div class="shortcake-attachment-preview">
				<div class="shortcake-attachment-preview-container attachment-preview attachment <# if ( data.type === 'image' && ! data.sizes ) { #>loading<# } #>">

					<button class="button button-small remove" data-id="{{ data.id }}">×</button>

					<# if ( data.sizes && data.sizes.thumbnail ) { #>
						<div class="thumbnail">
							<div class="centered">
								<img src="{{ data.sizes.thumbnail.url }}" alt="" width="{{ data.sizes.thumbnail.width }}" height="{{ data.sizes.thumbnail.height }}" />
							</div>
						</div>
					<# } else if ( data.type === 'image' && ( ! data.sizes || ! data.sizes.thumbnail ) ) { #>
						<div class="thumbnail">
							<div class="centered">
								<img src="{{ data.url }}" alt="" width="{{ data.width }}" height="{{ data.height }}" />
							</div>
						</div>
					<# } else if ( data.type !== 'image' ) { #>
						<div class="thumbnail">
							<div class="centered">
								<img src="{{ data.icon }}" />
							</div>
							<div class="filename"><div>{{ data.filename }}</div></div>
						</div>
					<# } else { #>
						<div class="loading-indicator">
							<span class="dashicons dashicons-format-image"></span>
							<div class="attachment-preview-loading"><ins></ins></div>
						</div>
					<# } #>

				</div>

				<div class="thumbnail-details-container has-attachment">
					<strong><?php esc_html_e( 'Attachment Details', 'shortcode-ui' ); ?></strong>
					<div class="filename">{{ data.filename }}</div>
					<div class="date-formatted">{{ data.dateFormatted }}</div>
					<div class="size">{{ data.filesizeHumanReadable }}</div>
					<# if ( data.type === 'image' ) { #>
						<div class="dimensions">{{ data.width }} &times; {{ data.height }}</div>
					<# } #>
					<div class="edit-link"><a href="{{ data.editLink }}"><?php esc_html_e( 'Edit Attachment', 'shortcode-ui' ); ?></a></div>
				</div>
			</div>
		</script>

		<?php
	}
}
