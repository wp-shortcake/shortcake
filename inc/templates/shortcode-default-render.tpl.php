<?php

$r  = '[';
$r .= $shortcode;
foreach( $attrs as $id => $value ) {
	$r .= " $id=\"$value\"";
}

$r .= ']';

if ( ! empty( $content ) ) {

	$r .= $content;
	$r .= "[/$shortcode]";
}

?>

<div style="background: #eee; padding: 5px;">
	<code>
		<?php echo esc_html( $r ); ?>
	</code>
</div>