<script type="text/html" id="tmpl-shortcode-default-edit-form">

	<div class="preview-shortcode">
		<h2 class="preview-shortcode-title">Preview</h2>
		<div class="preview-shortcode-content"></div>
	</div>
		

	<form class="edit-shortcode-form">
		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; Return to list view.</a></p>
		<h2 class="edit-shortcode-form-title">Edit {{ data.label }}</h2>

		<div class="edit-shortcode-form-fields"></div>
	</form>

</script>

<script type="text/html" id="tmpl-shortcode-ui-field-text">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" placeholder="{{ data.placeholder }}"/>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-url">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="url" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" class="code" placeholder="{{ data.placeholder }}"/>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-textarea">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<textarea name="{{ data.attr }}" id="{{ data.attr }}" placeholder="{{ data.placeholder }}">{{ data.value }}</textarea>
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
			<input type="radio" name="{{ data.attr }}" value="{{ value }}" <# if ( value == data.value ){ print('checked'); } #>>{{ label }}<br />
		<# }); #>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-checkbox">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="checkbox" name="{{ data.attr }}" id="{{ data.attr }}" value="true" <# if ( 'true' == data.value ){ print('checked'); } #>>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-email">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="email" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value}}" placeholder="{{ data.placeholder }}"/>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-number">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="number" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value}}" placeholder="{{ data.placeholder }}"/>
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-hidden">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="hidden" name="{{ data.attr }}" id="{{ data.attr }}" value="true" />
	</p>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-date">
	<p class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="date" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" placeholder="{{ data.placeholder }}"/>
	</p>
</script>
