<?php

class Shortcode_UI_Field_User_Select {

	private static $instance;

	// All registered user fields.
	private $user_fields  = array();

	// Field Settings.
	private $fields = array(
		'user_select' => array(
			'template' => 'shortcode-ui-field-user-select',
			'view'     => 'editAttributeFieldUserSelect',
		),
	);

	/**
	 * Setup the instance.
	 *
	 * @return Shortcode_UI_Field_User_Select
	 */
	public static function get_instance() {

		if ( ! isset( self::$instance ) ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	/**
	 * Add the required actions and filters.
	 */
	private function setup_actions() {

		add_filter( 'shortcode_ui_fields',             array( $this, 'filter_shortcode_ui_fields' ) );
		add_action( 'enqueue_shortcode_ui',            array( $this, 'action_enqueue_shortcode_ui' ) );
		add_action( 'wp_ajax_shortcode_ui_user_field', array( $this, 'action_wp_ajax_shortcode_ui_user_field' ) );
		add_action( 'wp_ajax_shortcode_ui_user_field_preselect', array( $this, 'action_wp_ajax_shortcode_ui_user_field_preselect' ) );
		add_action( 'shortcode_ui_loaded_editor',      array( $this, 'action_shortcode_ui_loaded_editor' ) );
	}

	/**
	 * Add our field to the shortcode fields.
	 *
	 * @param $fields
	 *
	 * @return array
	 */
	public function filter_shortcode_ui_fields( $fields ) {

		return array_merge( $fields, $this->fields );
	}

	/**
	 * Add Select2 for our UI.
	 */
	public function action_enqueue_shortcode_ui() {

		wp_enqueue_script( Shortcode_UI::$select2_handle );
		wp_enqueue_style( Shortcode_UI::$select2_handle );

		wp_localize_script( 'shortcode-ui', 'shortcodeUiUserFieldData', array(
			'nonce' => wp_create_nonce( 'shortcode_ui_field_user_select' ),
		) );
	}

	/**
	 * Output styles and templates used by user select field.
	 */
	public function action_shortcode_ui_loaded_editor() {
		?>

		<script type="text/html" id="tmpl-shortcode-ui-field-user-select">
			<div class="field-block shortcode-ui-field-user-select shortcode-ui-attribute-{{ data.attr }}">
				<label for="{{ data.id }}">{{{ data.label }}}</label>
				<select name="{{ data.attr }}" id="{{ data.id }}" class="shortcode-ui-user-select"></select>
				<# if ( typeof data.description == 'string' && data.description.length ) { #>
					<p class="description">{{{ data.description }}}</p>
				<# } #>
			</div>
		</script>

		<?php
	}

	/**
	 * Ajax handler for select2 user field queries.
	 * Output JSON containing user data.
	 * Requires that shortcode, attr and nonce are passed.
	 * Requires that the field has been correctly registered and can be found in $this->post_fields
	 * Supports passing page number and search query string.
	 *
	 * @return null
	 */
	public function action_wp_ajax_shortcode_ui_user_field() {

		$nonce               = isset( $_GET['nonce'] ) ? sanitize_text_field( wp_unslash( $_GET['nonce'] ) ) : null;
		$requested_shortcode = isset( $_GET['shortcode'] ) ? sanitize_text_field( wp_unslash( $_GET['shortcode'] ) ) : null;
		$requested_attr      = isset( $_GET['attr'] ) ? sanitize_text_field( wp_unslash( $_GET['attr'] ) ) : null;
		$page                = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : null;
		$search_str          = isset( $_GET['s'] ) ? sanitize_text_field( wp_unslash( $_GET['s'] ) ) : null;

		$response = array(
			'items'          => array(),
			'found_items'    => 0,
			'items_per_page' => 0,
		);

		$include = null;
		if ( isset( $_GET['include'] ) ) {
			// Make sure include is always an array & sanitize its values.
			$include = is_array( $_GET['include'] ) ? $_GET['include'] : explode( ',', $_GET['include'] );
			$include = array_map( 'absint', stripslashes_deep( $include ) );
		}

		if ( ! wp_verify_nonce( $nonce, 'shortcode_ui_field_user_select' ) ) {
			wp_send_json_error( $response );
		}

		$shortcodes = Shortcode_UI::get_instance()->get_shortcodes();

		// Shortcode not found.
		if ( ! isset( $shortcodes[ $requested_shortcode ] ) ) {
			wp_send_json_error( $response );
		}

		$shortcode = $shortcodes[ $requested_shortcode ];

		// Defaults user query args.
		$query_args['search_columns'] = array( 'ID', 'user_login', 'user_nicename', 'user_email' );
		$query_args['number']         = 10;

		// Include selected users to be displayed.
		if ( $include ) {
			$query_args['include'] = $include;
			$query_args['orderby'] = 'include';
		}

		// Supports WP_User_Query query args.
		foreach ( $shortcode['attrs'] as $attr ) {
			if ( $attr['attr'] === $requested_attr && isset( $attr['query'] ) ) {
				$query_args = $attr['query'];
			}
		}

		if ( $page ) {
			$query_args['paged'] = $page;
		}

		if ( $search_str ) {
			$query_args['search'] = '*' . $search_str . '*';
		}

		$query = new WP_User_Query( $query_args );

		foreach ( $query->get_results() as $user ) {
			array_push( $response['items'],
				array(
					'id'   => $user->ID,
					'text' => html_entity_decode( $user->display_name ),
				)
			);
		}

		$response['found_items']    = $query->get_total();
		$response['items_per_page'] = $query->query_vars['number'];

		wp_send_json_success( $response );
	}

}
