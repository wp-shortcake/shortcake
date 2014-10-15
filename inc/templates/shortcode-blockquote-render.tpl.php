<blockquote class="shortcode-ui-blockquote align<?php echo esc_attr( $attrs['align'] ); ?>">

	<?php echo esc_html( $content ); ?>

	<br/>

	<? if ( ! empty( $attrs['sourceurl'] ) ) { ?>
		<a href="<?php echo esc_attr( $attrs['sourceurl'] ); ?>">
	<? } ?>

	<small><?php echo esc_html( $attrs['source'] ); ?></small>

	<? if ( ! empty( $attrs['sourceurl'] ) ) { ?>
		</a>
	<? } ?>

</blockquote>