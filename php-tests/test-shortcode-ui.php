<?php

class Test_Shortcode_UI extends WP_UnitTestCase {

	public function setUp() {
		add_shortcode( 'test', array( $this, 'return_foo' ) );
	}

	public function return_foo() {
		return 'foo';
	}

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

	public function test_register_shortcode_malicious_html() {
		Shortcode_UI::get_instance()->register_shortcode_ui( 'foo', array(
			'inner_content'       => array(
				'label'           => '<script>gotcha()</script>',
				'description'     => '<iframe src="baddomain.com"></iframe>',
				),
			'attrs'               => array(
				array(
					'attr'        => 'bar',
					'label'       => '<strong>gotcha()</strong>',
					'description' => '<script>banana()</script>',
					),
				),
			) );
		$shortcodes = Shortcode_UI::get_instance()->get_shortcodes();
		$this->assertEquals( 'gotcha()', $shortcodes['foo']['inner_content']['label'] );
		$this->assertEmpty( $shortcodes['foo']['inner_content']['description'] );
		$this->assertEquals( '<strong>gotcha()</strong>', $shortcodes['foo']['attrs'][0]['label'] );
		$this->assertEquals( 'banana()', $shortcodes['foo']['attrs'][0]['description'] );
	}

	public function action_rest_api_init() {

	}

	public function test_rest_preview_permission_callback() {

		$instance    = Shortcode_UI::get_instance();
		$author_id   = self::factory()->user->create( array( 'role' => 'author' ) );
		$author_id_2 = self::factory()->user->create( array( 'role' => 'author' ) );
		$post_id     = self::factory()->post->create( array( 'post_author' => $author_id ) );

		wp_set_current_user( $author_id );

		$rest_request = new WP_REST_Request( 'GET', 'shortcode-ui/v1/preview', [ 'post_id' => $post_id ] );

		$permission = $instance->rest_preview_permission_callback( $rest_request );

		// Test that you cannot generate a shortcode preview without passing a post ID
		$this->assertInstanceOf( 'WP_Error', $permission );

		$rest_request->set_param( 'post_id', $post_id );
		$permission = $instance->rest_preview_permission_callback( $rest_request );

		// Assert that the user who created a post,
		// is able to preview a shortcode for that post.
		$this->assertTrue( $permission );

		wp_set_current_user( $author_id_2 );

		// Assert that a user who did NOT create the post
		// is NOT able to preview a shortcode for that post.
		$permission = $instance->rest_preview_permission_callback( $rest_request );
		$this->assertInstanceOf( 'WP_Error', $permission );

	}

	public function test_rest_sanitize_queries() {

		$queries = Shortcode_UI::get_instance()->rest_sanitize_queries( array(
			array(
				'counter'   => 'foo',
				'shortcode' => '\foo',
			),
		) );

		$this->assertEquals( count( $queries ), 1 );
		$this->assertInternalType( 'array', $queries );
		$this->assertInternalType( 'array', $queries[0] );
		$this->assertEquals( $queries[0]['counter'], 0 );
		$this->assertEquals( $queries[0]['shortcode'], 'foo' );

	}

	public function test_rest_validate_queries() {
		$this->assertTrue( Shortcode_UI::get_instance()->rest_validate_queries( array() ) );
		$this->assertFalse( Shortcode_UI::get_instance()->rest_validate_queries( 'foo' ) );
	}

	public function test_rest_sanitize_post_id() {
		$this->assertInternalType( 'int', Shortcode_UI::get_instance()->rest_sanitize_post_id( 'foo' ) );
	}

	public function test_rest_preview_callback() {

		$author_id = self::factory()->user->create( array( 'role' => 'author' ) );
		$post_id   = self::factory()->post->create( array( 'post_author' => $author_id ) );

		wp_set_current_user( $author_id );

		$rest_request = new WP_REST_Request( 'GET', 'shortcode-ui/v1/preview' );
		$rest_request->set_param( 'post_id', $post_id );
		$rest_request->set_param( 'shortcode', '[test]' );

		$response = Shortcode_UI::get_instance()->rest_preview_callback( $rest_request );

		$this->assertEquals( $response['shortcode'], '[test]' );
		$this->assertEquals( $response['post_id'], $post_id );
		$this->assertEquals( $response['preview'], 'foo' );

	}

	public function test_rest_preview_bulk_callback() {

		$author_id = self::factory()->user->create( array( 'role' => 'author' ) );
		$post_id   = self::factory()->post->create( array( 'post_author' => $author_id ) );

		wp_set_current_user( $author_id );

		$queries = array(
			array(
				'counter'   => 1,
				'shortcode' => '[test]',
			),
		);

		$rest_request = new WP_REST_Request( 'GET', 'shortcode-ui/v1/preview/bulk' );
		$rest_request->set_param( 'post_id', $post_id );
		$rest_request->set_param( 'queries', $queries );

		$response = Shortcode_UI::get_instance()->rest_preview_bulk_callback( $rest_request );

		$this->assertInternalType( 'array', $response );
		$this->assertEquals( $response[0]['shortcode'], '[test]' );
		$this->assertEquals( $response[0]['post_id'], $post_id );
		$this->assertEquals( $response[0]['counter'], 1 );
		$this->assertEquals( $response[0]['preview'], 'foo' );

	}

}
