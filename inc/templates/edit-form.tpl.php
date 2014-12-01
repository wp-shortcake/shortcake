<script type="text/html" id="tmpl-shortcode-default-edit-form">
	<form class="edit-shortcode-form">
		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; <?php esc_html_e( 'Return to list view.', 'shortcode-ui' ); ?></a></p>

		<div class="edit-shortcode-form-fields"></div>
	</form>
</script>

<script type="text/html" id="tmpl-tabbed-view-base">
    <div class="edit-shortcode-tabs" data-role="tab-group">
        <# _.each( data, function( tab, key ) { #>
            <a class="edit-shortcode-tab" data-role="tab" data-target="{{ key }}">{{ tab.label }}</a>
        <# }); #>
    </div>
    <div class="edit-shortcode-tabs-content" data-role="tab-content"></div>
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
