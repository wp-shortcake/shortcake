<?php

class Test_Shortcode_UI extends WP_UnitTestCase {

	public function test_plugin_loaded() {
		$this->assertTrue( function_exists( 'shortcode_ui_register_for_shortcode' ) );
	}

	public function test_expected_fields() {
		$fields = Shortcode_UI_Fields::get_instance()->get_fields();
		$this->assertArrayHasKey( 'attachment', $fields );
		$this->assertArrayHasKey( 'color', $fields );
		$this->assertArrayHasKey( 'post_select', $fields );
	}

	public function test_filter_shortcode_atts_decode_encoded() {

		$shortcode = 'shortcake_encoding_test';

		// Add test Shortcode.
		add_shortcode( $shortcode, '__return_null' );

		// Register test Shortcode UI.
		shortcode_ui_register_for_shortcode( $shortcode, array(
			'attrs' => array(
				array(
					'attr'   => 'test',
					'type'   => 'text',
					'encode' => true,
				),
			),
		) );

		$encoded = '%3Cb%20class%3D%22foo%22%3Ebar%3C%2Fb%3E';
		$decoded = '<b class="foo">bar</b>';

		// Parse shortcode attributes.
		$attr = shortcode_atts( array( 'test' => null ), array( 'test' => $encoded ), $shortcode );

		// Expect value of $attr['test'] to be decoded.
		$this->assertEquals( $attr['test'], $decoded );

	}

}
