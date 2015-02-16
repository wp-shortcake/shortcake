<?php

add_action( 'init', function() {

	/**
	 * Register your shortcode as you would normally.
	 * This is a simple example for a pullquote with a citation.
	 */
	add_shortcode( 'shortcake_dev', function( $attr, $content = '' ) {

		$attr = wp_parse_args( $attr, array(
			'source' => '',
			'post'   => '',
			'page'   => '',
		) );

		if ( ! empty( $attr['page'] ) ) {
 			$attr['page'] = explode( ',', $attr['page'] );
 			$attr['page'] = array_map( 'get_the_title', $attr['page'] );
 			$attr['page'] = implode( ', ', $attr['page'] );
 		}

		ob_start();

		?>

		<section class="pullquote" style="padding: 20px; background: rgba(0,0,0,0.1);">
			<p style="margin:0; padding: 0;">
				<b>Content:</b> <?php echo esc_html( $content ); ?></br>
				<b>Source:</b> <?php echo esc_html( $attr['source'] ); ?></br>
				<b>Fieldmanager Textarea:</b> <?php echo esc_html( $attr['fieldmanager_textarea'] ); ?></br>
				<b>Fieldmanager Media:</b> <?php echo esc_html( get_the_title( $attr['fieldmanager_media'] ) ); ?></br>
				<b>Page:</b> <?php echo esc_html( $attr['page'] ); ?></br>
				<b>Image:</b> <?php echo wp_get_attachment_image( $attr['attachment'], array( 50, 50 ) ); ?></br>
			</p>
		</section>

		<?php

		return ob_get_clean();

	} );

	/**
	 * Register a UI for the Shortcode.
	 * Pass the shortcode tag (string)
	 * and an array or args.
	 */
	shortcode_ui_register_for_shortcode(
		'shortcake_dev',
		array(

			// Display label. String. Required.
			'label' => 'Shortcake Dev',

			// Icon/attachment for shortcode. Optional. src or dashicons-$icon. Defaults to carrot.
			'listItemImage' => 'dashicons-editor-quote',

			// Available shortcode attributes and default values. Required. Array.
			// Attribute model expects 'attr', 'type' and 'label'
			// Supported field types: text, checkbox, textarea, radio, select, email, url, number, and date.
			'attrs' => array(

				array(
					'label' => 'Attachment',
					'attr'  => 'attachment',
					'type'  => 'attachment',
					'libraryType' => array( 'image' ),
					'addButton'   => 'Select Image',
					'frameTitle'  => 'Select Image',
				),

				array(
					'label'    => 'Select Page',
					'attr'     => 'page',
					'type'     => 'post_select',
					'query'    => array( 'post_type' => 'page' ),
					'multiple' => true,
				),

				array(
					'label' => 'Quote',
					'attr'  => 'content',
					'type'  => 'textarea',
				),
				array(
					'label' => 'Cite',
					'attr'  => 'source',
					'type'  => 'text',
					'placeholder' => 'Test placeholder',
				),
				array(
					'label' => 'Fieldmanager Textarea',
					'attr'  => 'fieldmanager_textarea',
					'type'  => 'Fieldmanager_TextArea',
				),
				array(
					'label' => 'Fieldmanager Media',
					'attr'  => 'fieldmanager_media',
					'type'  => 'Fieldmanager_Media',
				),

			),
		)
	);

} );
