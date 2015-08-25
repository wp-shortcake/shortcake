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
}
