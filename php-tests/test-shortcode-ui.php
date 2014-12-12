<?php

class Test_Shortcode_UI extends WP_UnitTestCase {

	public function test_plugin_loaded() {
		$this->assertTrue( function_exists( 'shortcode_ui_register_for_shortcode' ) );
	}

}
