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
		'text' => array(),
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
		'color' => array(
			'template' => 'shortcode-ui-field-color',
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
		add_action( 'init', array( $this, 'action_init' ) );
		add_action( 'shortcode_ui_loaded_editor', array( $this, 'action_shortcode_ui_loaded_editor' ), 100 );
	}

	/**
	 * Init.
	 * @return null
	 */
	public function action_init() {

		/**
		 * Filter the available fields.
		 * @var array
		 */
		$this->fields = apply_filters( 'shortcode_ui_fields', $this->fields );

		// set default args for each field.
		$field_defaults = $this->field_defaults;
		$this->fields = array_map( function( $args ) use ( $field_defaults ) { return wp_parse_args( $args, $field_defaults ); }, $this->fields );

	}

	public function action_shortcode_ui_loaded_editor() {

		wp_localize_script( 'shortcode-ui', 'shortcodeUIFieldData', $this->fields );

	}

}
