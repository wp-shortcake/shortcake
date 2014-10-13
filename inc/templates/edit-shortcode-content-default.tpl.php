<script type="text/html" id="tmpl-edit-shortcode-content-default">

	<form class="edit-shortcode-form">
		<h2 class="edit-shortcode-form-title">Edit {{ data.label }}</h2>
		<div class="edit-shortcode-form-fields"></div>
	</form>

</script>

<script type="text/html" id="tmpl-edit-shortcode-content-default-single-input">

	<label for="{{ data.id }}">{{ data.label }}</label>
	<input type="text" name="{{ data.id }}" id="{{ data.id }}" value="{{ data.value }}"/>

</script>
