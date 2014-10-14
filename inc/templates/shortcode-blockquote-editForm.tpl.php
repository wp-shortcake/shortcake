<script type="text/html" id="tmpl-shortcode-blockquote-edit-form">

	<form class="edit-shortcode-form">

		<h2 class="edit-shortcode-form-title">Edit {{ data.label }}</h2>

		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; Cancel Shortcode</a></p>

		<div class="edit-shortcode-form-fields">

			<div>
				<label for="shortcode-blockquote-content">Quote</label>
				<textarea id="shortcode-blockquote-content" name="content">{{ data.content }}</textarea>
			</div>

			<div>
				<label for="shortcode-blockquote-source">Source</label>
				<input type="text" id="shortcode-blockquote-source" name="source" value="{{ data.shortcodeAtts.source }}"/>
			</div>

			<div>
				<label for="shortcode-blockquote-align">Alignment</label>
				<select id="shortcode-blockquote-align" name="align">
					<option value="left" {{ data.shortcodeAtts.align === 'left' ? 'selected="selected"' : void 0 }}>Left</option>
					<option value="center" {{ data.shortcodeAtts.align === 'center' ? 'selected="selected"' : void 0 }}>Center</option>
					<option value="right" {{ data.shortcodeAtts.align === 'right' ? 'selected="selected"' : void 0 }}>Right</option>
				</select>
			</div>

		</div>

	</form>

</script>