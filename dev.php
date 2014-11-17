<?php

add_action( 'init', function() {

	/**
	 * Register your shorcode as you would normally.
	 * This is a simple example for a pullquote with a citation.
	 */
	add_shortcode( 'pullquote', function( $attr, $content = '' ) {

		$attr = wp_parse_args( $attr, array(
			'source' => '',
			'image'  => '',
		) );

		?>

		<section class="pullquote" style="overflow: hidden;">
			<?php if ( $attr['image'] ) : ?>
			<div style="float: left; margin-right: 20px;">
				<?php echo wp_get_attachment_image( $attr['image'], array( 112, 112 ) ); ?>
			</div>
			<?php endif; ?>

			<?php echo esc_html( $content ); ?><br/>
			<cite><em><?php echo esc_html( $attr['source'] ); ?></em></cite>
		</section>

		<?php
	} );

	/**
	 * Register a UI for the Shortcode.
	 * Pass the shortcode tag (string)
	 * and an array or args.
	 */
	shortcode_ui_register_for_shortcode(
		'blockquote',
		array(

			// Display label. String. Required.
			'label' => 'Dev Blockquote',

			// Icon/image for shortcode. Optional. src or dashicons-$icon. Defaults to carrot.
			'listItemImage' => 'dashicons-editor-quote',

			// Available shortcode attributes and default values. Required. Array.
			// Attribute model expects 'attr', 'type' and 'label'
			// Supported field types: text, checkbox, textarea, radio, select, email, url, number, and date.
			'attrs' => array(

				array(
					'label' => 'Quote',
					'attr'  => 'content',
					'type'  => 'Fieldmanager_TextArea',
				),

				array(
					'label' => 'Image',
					'attr'  => 'image',
					'type'  => 'Fieldmanager_Media',
				),

				array(
					'label' => 'Cite',
					'attr'  => 'source',
					'type'  => 'Fieldmanager_Textfield',
				),

				array(
					'label' => 'Post',
					'attr'  => 'post',
					'type'  => 'post',
					'query' => array(
						'post_type' => array( 'fusion_stream' ),
						'posts_per_page' => 100,
					)
				),

			),
		)
	);

} );
