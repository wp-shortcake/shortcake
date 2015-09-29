<script type="text/html" id="tmpl-shortcake-image-preview">

<div class="shortcake-attachment-preview">

	<div class="shortcake-attachment-preview-container attachment-preview attachment <# if ( ! data.sizes ) { #>loading<# } #>">

		<button class="button button-small remove" data-id="{{ data.id }}">×</button>

		<div class="loading-indicator">
			<span class="dashicons dashicons-format-image"></span>
			<div class="attachment-preview-loading"><ins></ins></div>
		</div>

		<# if ( data.sizes ) { #>
			<div class="thumbnail">
				<div class="centered">
					<img src="{{ data.sizes.thumbnail.url }}" alt="" style="width: {{ data.sizes.thumbnail.width }}px; height: {{ data.sizes.thumbnail.height }}px;">
				</div>
			</div>
		<# } #>

	</div>

	<div class="thumbnail-details-container has-attachment">
		<# if ( data.sizes ) { #>
			<strong>Thumbnail Details</strong>
			<div class="filename">{{ data.filename }}</div>
			<div class="date-formatted">{{ data.dateFormatted }}</div>
			<div class="size">{{ data.filesizeHumanReadable }}</div>
			<div class="dimensions">{{ data.width }} &times; {{ data.height }}</div>
			<div class="edit-link"><a href="{{ data.editLink }}">Edit Attachment</a></div>
		<# } #>
	</div>

</div>

</script>
