<?php

add_action( 'init', function() {

	$instance = new Shortcode_UI();

	$args = array(
		'label' => 'Test Shortcode',
		'image' => 'dashicons-carrot',
		'shortcodeAtts' => array(
			array( 'label' => 'ID', 'id' => 'id' ),
			array( 'label' => 'Align', 'id' => 'align', 'value' => 'left' ),
		)
	);

	$instance->register_shortcode_ui( 'test_shortcode', $args );

	$args = array(
		'label' => 'Blockquote',
		'image' => 'dashicons-editor-quote',
		'shortcodeAtts' => array(
			array( 'label' => 'Background Color', 'id' => 'bg_color' ),
			array( 'label' => 'Align', 'id' => 'align', 'value' => 'left' ),
			array( 'label' => 'Font Size', 'id' => 'font-size', 'value' => 'large' ),
		),
		'templates' => array(
			'render'   => $instance->plugin_dir . '/inc/shortcodes/blockquote/render.tpl.php',
			'editForm' => $instance->plugin_dir . '/inc/shortcodes/blockquote/editForm.tpl.php',
		)
	);

	$instance->register_shortcode_ui( 'blockquote', $args );


} );