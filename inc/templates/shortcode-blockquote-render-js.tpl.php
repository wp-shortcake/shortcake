<script type="text/html" id="tmpl-shortcode-blockquote-render-js">
	<blockquote class="shortcode-ui-blockquote align{{ data.attrs.align }}">

		{{ data.content }}

		<br/>

		<# if ( data.attrs.sourceurl.length > 0  ) { #>
			<a href="{{ data.attrs.sourceurl }}">
		<# } #>

		<small>{{ data.attrs.source }}</small>

		<# if ( data.attrs.sourceurl.length > 0  ) { #>
			</a>
		<# } #>

	</blockquote>
</script>