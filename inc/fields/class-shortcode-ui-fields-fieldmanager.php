<?php

class Shortcode_UI_Fields_Fieldmanager {

	static $instance;

	private $fields = array(
		'Fieldmanager_Textfield' => array(
			'template' => 'shortcode-ui-field-Fieldmanager_Textfield',
		),
		'Fieldmanager_TextArea' => array(
			'template' => 'shortcode-ui-field-Fieldmanager_TextArea',
		),
		'Fieldmanager_Media' => array(
			'template' => 'shortcode-ui-field-Fieldmanager_Media',
			'view'     => 'editAttributeFieldMedia',
		),
	);

	public static function get_instance() {
		if ( null == self::$instance ) {
			self::$instance = new self;
			self::$instance->setup_actions();
		}
		return self::$instance;
	}

	private function setup_actions() {

		$this->initialize_templates();

		add_filter( 'shortcode_ui_fields', function( $fields ) {
			return array_merge( $fields, $this->fields );
		}  );

		add_action( 'print_media_templates', array( $this, 'action_print_media_templates' ), 100 );
		add_action( 'wp_ajax_shortcode_ui_get_thumbnail_image', array( $this, 'ajax_get_thumbnail_image' ) );

	}

	private function initialize_templates() {

		foreach ( $this->fields as $field_class => $field_attr ) {

			$field = new $field_class( '{{ data.label }}', array( 'name' => '{{ data.attr }}' ) );

			add_action( 'print_media_templates', function() use ( $field_class, $field ) {

				printf(
					'<script type="text/html" id="tmpl-shortcode-ui-field-%s">',
					$field_class
				);

				echo $field->element_markup( '{{ data.value }}' );
				echo "</script>\r";

			} );

		}

	}

	public function ajax_get_thumbnail_image() {

		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'shortcode-ui-get-thumbnail-image' ) ) {
			wp_send_json_error();
		}

		$id    = intval( $_POST['id'] );
		$size  = sanitize_text_field( $_POST['size'] );
		$image = wp_get_attachment_image_src( $id, $size );

		if ( ! $image ) {
			wp_send_json_error();
		}

		wp_send_json_success( array(
			'src'    => $image[0],
			'width'  => $image[1],
			'height' => $image[2],
			'html'   => wp_get_attachment_image( $id, $size ),
		) );

	}


	public function action_print_media_templates() {
		?>

<script>

( function( $ ) {

	var sui = window.Shortcode_UI;

	sui.views.editAttributeFieldMedia = sui.views.editAttributeField.extend( {

		events: {
			'click .fm-media-button': 'reorderModals',
		},

		render: function() {

			this.template = wp.media.template( 'shortcode-ui-field-' + this.model.get( 'type' ) );
			var html = $( this.template( this.model.toJSON() ) );

			// Define preview size for use by fieldmanager JS.
			window.fm_preview_size = window.fm_preview_size || [];
			window.fm_preview_size[ this.model.get('attr') ] = 'thumbnail';

			// Create template if neccessary.
			if ( this.model.get('value') ) {

				var data = {
					action: 'shortcode_ui_get_thumbnail_image',
					id: this.model.get('value'),
					size: 'thumbnail',
					nonce: shortcodeUIData.nonces.thumbnailImage
				};

				$.post( ajaxurl, data, function(response) {

					if ( ! response.success ) {
						return;
					}

					var previewHTML = 'Uploaded file:</br>';
					previewHTML += '<a href="#">' + response.data.html + '</a></br>';
					previewHTML += '<a class="fm-media-remove fm-delete" href="#">remove</a>';
					html.find('.media-wrapper').append( previewHTML );

				});

			}

			return this.$el.html( html );

		},

		/**
		 * Now we have 2 media frames.
		 * Ensure that the new frame is on top.
		 */
		reorderModals: function( e ) {
			var t = this;
			// Make sure the frame has been created already.
			window.setTimeout( function() {
				var id = $( e.target ).attr( 'id' );
				var frame = window.fm_media_frame[ id ];
				frame.$el.closest( '.media-modal' ).parent().appendTo( 'body' );
			}, 100 );
		}

	} );

} )( jQuery );

</script>

		<?php
	}

}
