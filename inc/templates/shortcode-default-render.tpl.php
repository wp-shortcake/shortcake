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

echo "<b>$r</b>";