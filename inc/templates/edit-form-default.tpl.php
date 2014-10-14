<script type="text/html" id="tmpl-edit-shortcode-content-default">

	<form class="edit-shortcode-form">

		<h2 class="edit-shortcode-form-title">Edit {{ data.label }}</h2>

		<p><a href="#" class="edit-shortcode-form-cancel">&#8592; Cancel Shortcode</a></p>

		<div class="edit-shortcode-form-fields">
			<# _.each( data.attrs, function( value, id ) { #>
				<div>
					<label for="{{ id }}">{{ id }}</label>
					<input type="text" name="{{ id }}" id="{{ id }}" value="{{ value }}"/>
				</div>
			<# }); #>
		</div>

	</form>

</script>