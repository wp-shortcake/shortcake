<script type="text/html" id="tmpl-shortcode-default-edit-form">
	<form class="edit-shortcode-form">
		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; <?php esc_html_e( 'Back to list', 'shortcode-ui' ); ?></a></p>

		<div class="edit-shortcode-form-fields"></div>
	</form>
</script>

<script type="text/html" id="tmpl-tabbed-view-base">
    <div class="{{{ data.styles.group }}}" data-role="tab-group">
        <# _.each( data.tabs, function( tab, key ) { #>
            <a href="#" class="{{{ data.styles.tab }}}" data-role="tab" data-target="{{ key }}">{{ tab.label }}</a>
        <# }); #>
    </div>
    <div class="edit-shortcode-tabs-content" data-role="tab-content"></div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-text">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<input type="text" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-url">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<input type="url" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" class="code" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-textarea">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<textarea name="{{ data.attr }}" id="{{ data.id }}" {{{ data.meta }}}>{{ data.value }}</textarea>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-select">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<select name="{{ data.attr }}" id="{{ data.id }}" {{{ data.meta }}}>
			<# _.each( data.options, function( label, value ) { #>
				<option value="{{ value }}" <# if ( value == data.value ){ print('selected'); } #>>{{ label }}</option>
			<# }); #>
		</select>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-radio">
	<div class="field-block">
		<label>{{ data.label }}</label>
		<# _.each( data.options, function( label, value ) { #>
			<label>
				<input type="radio" name="{{ data.attr }}" value="{{ value }}" <# if ( value == data.value ) { print('checked'); } #> />
				{{ label }}
			</label>
		<# }); #>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-checkbox">
	<div class="field-block">
		<label for="{{ data.id }}">
			<input type="checkbox" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" <# if ( 'true' == data.value ){ print('checked'); } #>>
			{{ data.label }}
		</label>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-email">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<input type="email" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value}}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-number">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<input type="number" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value}}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-hidden">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<input type="hidden" name="{{ data.attr }}" id="{{ data.id }}" value="true" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-date">
	<div class="field-block">
		<label for="{{ data.id }}">{{ data.label }}</label>
		<input type="date" name="{{ data.attr }}" id="{{ data.id }}" value="{{ data.value }}" {{{ data.meta }}}/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-content">
	<div class="field-block">
		<label for="inner_content">{{ data.label }}</label>
		<textarea id="inner_content" name="inner_content" class="content-edit" {{{ data.meta }}}>{{ data.value }}</textarea>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>
