<script type="text/html" id="tmpl-ui-toolbar">

	<div class="toolbar toolbar-search">
		<# if ( data.shortcode ) { #>
			<p><a href="#" class="edit-shortcode-form-cancel">&#8592; <?php esc_html_e( 'Back to list', 'shortcode-ui' ); ?></a></p>
		<# } else { #>
			<input type="text" name="shortcode-list-search" />
		<# } #>
	</div>

	<div class="content"></div>

</script>
