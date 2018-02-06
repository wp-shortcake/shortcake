<?php

/**
 * Primary controller class for Shortcode UI Color Field
 */
class Shortcode_UI_Field_Color {

	/**
	 * Shortcode UI Color Field controller instance.
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
	 * Settings for the Color Field.
	 *
	 * @access private
	 * @var array
	 */
	private $fields = array(
		'color' => array(
			'template' => 'fusion-shortcake-field-color',
			'view'     => 'editAttributeFieldColor',
		),
	);

	/**
	 * Get instance of Shortcode UI Color Field controller.
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
	 * Set up actions needed for Color Field
	 */
	private function setup_actions() {
		add_filter( 'shortcode_ui_fields', array( $this, 'filter_shortcode_ui_fields' ) );
		add_action( 'enqueue_shortcode_ui', array( $this, 'action_enqueue_shortcode_ui' ) );
	}

	/**
	 * Whether or not the color attribute is present in registered shortcode UI
	 *
	 * @return bool
	 */
	private function color_attribute_present() {

		foreach ( Shortcode_UI::get_instance()->get_shortcodes() as $shortcode ) {

			if ( empty( $shortcode['attrs'] ) ) {
				continue;
			}

			foreach ( $shortcode['attrs'] as $attribute ) {
				if ( empty( $attribute['type'] ) ) {
					continue;
				}

				if ( 'color' === $attribute['type'] ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Add Color Field settings to Shortcake fields
	 *
	 * @param array $fields
	 * @return array
	 */
	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	/**
	 * Enqueue necessary scripts and styles, if required, and enqueue template
	 * to be output in the footer.
	 */
	public function action_enqueue_shortcode_ui() {
		if ( ! $this->color_attribute_present() ) {
			return;
		}

		wp_enqueue_script( 'wp-color-picker' );
		wp_enqueue_style( 'wp-color-picker' );

		add_action( 'admin_print_footer_scripts', array( $this, 'action_admin_print_footer_scripts' ) );
	}

	/**
	 * Output the field template.
	 */
	public function action_admin_print_footer_scripts() {
		?>
		<script type="text/html" id="tmpl-fusion-shortcake-field-color">
			<div class="field-block shortcode-ui-field-color shortcode-ui-attribute-{{ data.attr }}">
				<label for="{{ data.attr }}">{{{ data.label }}}</label>
				<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" data-default-color="{{ data.value }}" {{{ data.meta }}}/>
				<# if ( typeof data.description == 'string' && data.description.length ) { #>
					<p class="description">{{{ data.description }}}</p>
				<# } #>
			</div>
		</script>
		<?php
	}
}
