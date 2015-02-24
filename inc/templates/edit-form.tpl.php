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

<script type="text/html" id="tmpl-iframe-doc">
    <!DOCTYPE html>
    <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

            {{{ data.head }}}
        </head>
        <body class="{{{ data.body_classes }}}">
            {{{ data.body }}}
        </body>
    </html>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-text">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="text" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" placeholder="{{ data.placeholder }}"/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-url">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="url" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" class="code" placeholder="{{ data.placeholder }}"/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-textarea">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<textarea name="{{ data.attr }}" id="{{ data.attr }}" placeholder="{{ data.placeholder }}">{{ data.value }}</textarea>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-select">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<select name="{{ data.attr }}" id="{{ data.attr }}">
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
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<# _.each( data.options, function( label, value ) { #>
			<input type="radio" name="{{ data.attr }}" value="{{ value }}" <# if ( value == data.value ){ print('checked'); } #>>{{ label }}<br />
		<# }); #>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-checkbox">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="checkbox" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" <# if ( 'true' == data.value ){ print('checked'); } #>>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-email">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="email" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value}}" placeholder="{{ data.placeholder }}"/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-number">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="number" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value}}" placeholder="{{ data.placeholder }}"/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-hidden">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="hidden" name="{{ data.attr }}" id="{{ data.attr }}" value="true" />
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-field-date">
	<div class="field-block">
		<label for="{{ data.attr }}">{{ data.label }}</label>
		<input type="date" name="{{ data.attr }}" id="{{ data.attr }}" value="{{ data.value }}" placeholder="{{ data.placeholder }}"/>
		<# if ( typeof data.description == 'string' ) { #>
			<p class="description">{{ data.description }}</p>
		<# } #>
	</div>
</script>

<script type="text/html" id="tmpl-shortcode-ui-content">
	<div class="field-block">
		<label for="inner_content">{{ data.label }}</label>
		<textarea id="inner_content" name="inner_content" class="content-edit">{{ data.value }}</textarea>
	</div>
</script>
