<script type="text/html" id="tmpl-shortcode-default-edit-form">

	<form class="edit-shortcode-form">

		<h2 class="edit-shortcode-form-title">Edit {{ data.label }}</h2>

		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; Return to list view.</a></p>

		<div class="edit-shortcode-form-fields">
		</div>

	</form>

</script>

<script type="text/html" id="tmpl-shortcode-ui-field-text">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}"/>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-url">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" class="code"/>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-textarea">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<textarea name="{{ data.attr }}" id="{{ data.attr }}">{{ data.value }}</textarea>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-select">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<select name="{{ data.attr }}" id="{{ data.attr }}">
			<# _.each( data.options, function( label, value ) { #>
				<option value="{{ value }}" <# if ( value == data.value ){ print('selected'); } #>>{{ label }}</option>
			<# }); #>
		</select>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-radio">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<# _.each( data.options, function( label, value ) { #>
			<input type="radio" name="{{ data.attr }}" value="{{ value }}" <# if ( value == data.value ){ print('selected'); } #>>{{ label }}<br />
		<# }); #>
	</p>
</script>