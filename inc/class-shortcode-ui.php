<?php

class Shortcode_UI {

	private $plugin_dir;
	private $plugin_url;

	private $shortcodes = array();

	function __construct() {

		$this->plugin_version = '0.1';
		$this->plugin_dir     = plugin_dir_path( dirname(  __FILE__ ) );
		$this->plugin_url     = plugin_dir_url( dirname( __FILE__ ) );

		add_action( 'media_buttons', array( $this, 'action_media_buttons' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		add_action( 'admin_footer-post.php', array( $this, 'print_templates' ) );
		add_action( 'admin_footer-post-new.php', array( $this, 'print_templates' ) );

	}

	function register_shortcode_ui( $shortcode, $args = array() ) {

		$defaults = array(
			'label' => '',
			'attrs' => array(),
			'listItemImage'      => '',   // src or 'dashicons-' - used in insert list.
			'template-edit-form' => null, // Template used to render edit form
			'template-render'    => null, // Template used to render on front end
			'template-render-js' => null, // Template used to render in tinyMCE
		);

		// Parse args.
		$args = wp_parse_args( $args, $defaults );

		// strip invalid
		foreach ( $args as $key => $value ) {
			if ( ! array_key_exists( $key, $defaults ) ) {
				unset( $args[ $key ] );
			}
		}

		$args['shortcode'] = $shortcode;

		add_shortcode( $shortcode, array( $this, 'render_shortcode' ) );

		$this->shortcodes[ $shortcode ] = $args;

	}

	public function action_media_buttons() {

		$post = get_post();

		if ( ! $post && ! empty( $GLOBALS['post_ID'] ) )
			$post = $GLOBALS['post_ID'];

		$img = '<span class="wp-media-buttons-icon"></span> ';

		printf(
			'<button class="%s" title="%s">%s</button>',
			'button shortcode-editor-open-insert-modal add_media',
			esc_attr__( 'Add Shortcode', 'shortcode-ui' ),
			$img . __( 'Add Shortcode', 'shortcode-ui' )
		);

	}

	function enqueue_scripts( $hook ) {

    	if ( in_array( $hook, array( 'post.php', 'post-new.php' ) ) ) {

    		wp_enqueue_script( 'shortcode-ui', $this->plugin_url . 'js/shortcode-ui.js', array( 'jquery', 'backbone' ), $this->plugin_version );
    		wp_enqueue_style( 'shortcode-ui', $this->plugin_url . 'css/shortcode-ui.css', array(), $this->plugin_version );

    		wp_localize_script( 'shortcode-ui', ' shortcodeUIData', array(
    			'shortcodes' => array_values( $this->shortcodes ),
    			'modalOptions' => array(
    				'media_frame_title' => 'Insert Shortcode',
					'insert_into_button_label' => 'Button',
					'media_toolbar_secondary_button_label' => 'Secondary Button',
					'default_title' => 'Default Title',
				)
    		) );

    	}

	}

	public function print_templates() {

		$this->get_view( 'media-frame' );
		$this->get_view( 'list-item' );
		$this->get_view( 'shortcode-default-edit-form' );
		$this->get_view( 'shortcode-default-render-js' );

		// Load individual shortcode template files.
		foreach ( $this->shortcodes as $shortcode => $args ) {

			// Load shortcode edit form template.
			if ( ! empty( $args['template-edit-form'] ) ) {
				$this->get_view( 'shortcode-' . $shortcode . '-edit-form' );
			}

			// Load shortcode edit form template.
			if ( ! empty( $args['template-render-js'] ) ) {
				$this->get_view( 'shortcode-' . $shortcode . '-render-js' );
			}

		}

	}

	public function get_view( $template, $template_args = array(), $echo = true ) {

 		$template_dir  = $this->plugin_dir . 'inc/templates/';
		$template_file = $template_dir . $template . '.tpl.php';

		if ( ! file_exists( $template_file ) ) {
			return '';
		}

		extract( $template_args, EXTR_SKIP );

		ob_start();
		include $template_file;

		if ( ! $echo ) {
			return ob_get_clean();
		}

		echo ob_get_clean();

	}

	function render_shortcode( $atts, $content = null, $shortcode ) {

		if ( ! array_key_exists( $shortcode, $this->shortcodes ) ) {
			return;
		}

		$args            = $this->shortcodes[ $shortcode ];
		$atts['content'] = $content;
		$atts            = apply_filters( "shortcode_ui_render_atts_$shortcode", $atts );

		if ( $args['template-render'] ) {
			return $this->get_view( $args['template-render'], $atts, false );
		}

	}

}

function shortcode_ui_modify_tinyMCE4( $mceInit, $editor_id ) {

	// Toolbar buttons are stored as a comma separated list - lets make them an array.
	$toolbar1 = explode( ',', $mceInit['toolbar1'] );
	$toolbar2 = explode( ',', $mceInit['toolbar2'] );

	// buttons to completely remove.
	$remove = array( 'blockquote' );

	// Remove these buttons if they are found in toolbar1 or toolbar2
	foreach ( $remove as $name ) {

		if ( $key = array_search( $name, $toolbar1 ) ) {
			unset( $toolbar1[$key] );
		}

		if ( $key = array_search( $name, $toolbar2 ) ) {
			unset( $toolbar2[$key] );
		}

	}

	// Convert back to original format.
	$mceInit['toolbar1'] = implode( ',', $toolbar1 );
	$mceInit['toolbar2'] = implode( ',', $toolbar2 );

	return $mceInit;
}

// Modify Tiny_MCE init
add_filter( 'tiny_mce_before_init', 'shortcode_ui_modify_tinyMCE4', 10, 2 );