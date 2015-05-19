<?php

class Shortcake_Field_Color {

	private static $instance;

	// All registered post fields.
	private $post_fields  = array();

	// Field Settings.
	private $fields = array(
		'color' => array(
			'template' => 'fusion-shortcake-field-color',
			'view'     => 'editAttributeFieldColor',
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
		add_action( 'admin_enqueue_scripts', array( $this, 'action_admin_enqueue_scripts' ), 100 );
		add_action( 'shortcode_ui_loaded_editor', array( $this, 'load_template' ) );

	}

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

	public function filter_shortcode_ui_fields( $fields ) {
		return array_merge( $fields, $this->fields );
	}

	public function action_admin_enqueue_scripts() {

		if ( ! $this->color_attribute_present() ) {
			return;
		}

		$script = plugins_url( 'js/build/field-color.js', dirname( dirname( __FILE__ ) ) );

		wp_enqueue_script( 'shortcake-field-color', $script, array( 'shortcode-ui' ) );

	}

	/**
	 * Output templates used by the color field.
	 */
	public function load_template() {

		if ( ! $this->color_attribute_present() ) {
			return;
		}

		wp_enqueue_script( 'wp-color-picker' );
		wp_enqueue_style( 'wp-color-picker' );

		?>

		<script type="text/html" id="tmpl-fusion-shortcake-field-color">
			<div class="field-block">
				<label for="{{ data.attr }}">{{ data.label }}</label>
				<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" data-default-color="{{ data.value }}" {{{ data.meta }}}/>
				<# if ( typeof data.description == 'string' ) { #>
					<p class="description">{{ data.description }}</p>
				<# } #>
			</div>
		</script>

		<?php
	}

}
