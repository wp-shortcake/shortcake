<?php

/**
 * Primary controller class for default Shortcake fields
 */
class Shortcode_UI_Fields {

	/**
	 * Shortcake Fields controller instance.
	 *
	 * @access private
	 * @var object
	 */
	private static $instance;

	/**
	 * Default settings for each field
	 *
	 * @access private
	 * @var array
	 */
	private $field_defaults = array(
		'template' => 'shortcode-ui-field-text',
		'view'     => 'editAttributeField',
		'encode'   => false,
	);

	/**
	 * Settings for default Fields.
	 *
	 * @access private
	 * @var array
	 */
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
		'range' => array(
			'template' => 'shortcode-ui-field-range',
		),
	);

	/**
	 * Get instance of Shortcake Field controller.
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
	 * Set up actions needed for default fields
	 */
	private function setup_actions() {
		add_action( 'init', array( $this, 'action_init' ) );
		add_action( 'enqueue_shortcode_ui', array( $this, 'action_enqueue_shortcode_ui' ), 100 );
	}

	/**
	 * Perform setup actions.
	 */
	public function action_init() {

		/**
		 * Filter the available fields.
		 * @var array
		 */
		$this->fields = apply_filters( 'shortcode_ui_fields', $this->fields );

		// set default args for each field.
		$array_map = array();
		foreach ($this->fields as $field_name => $field) {
			$array_map[ $field_name ] = wp_parse_args( $field, $this->field_defaults );
		}
		$this->fields = $array_map;

	}

	/**
	 * Get all registered fields
	 *
	 * @return array
	 */
	public function get_fields() {
		return $this->fields;
	}

	/**
	 * Add localization data needed for default fields
	 */
	public function action_enqueue_shortcode_ui() {
		wp_localize_script( 'shortcode-ui', 'shortcodeUIFieldData', $this->fields );
	}

}
