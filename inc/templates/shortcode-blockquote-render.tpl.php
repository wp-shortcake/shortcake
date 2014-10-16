<blockquote class="shortcode-ui-blockquote align<?php echo esc_attr( $attrs['align'] ); ?>">

	<?php echo esc_html( $content ); ?>

	<br/>

	<?php if ( ! empty( $attrs['sourceurl'] ) ) { ?>
		<a href="<?php echo esc_attr( $attrs['sourceurl'] ); ?>">
	<?php } ?>

	<small><?php echo esc_html( $attrs['source'] ); ?></small>

	<?php if ( ! empty( $attrs['sourceurl'] ) ) { ?>
		</a>
	<?php } ?>

</blockquote>