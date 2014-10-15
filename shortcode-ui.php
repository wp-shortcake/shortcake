<?php
/**
 * Plugin Name: Shortcode UI
 * Version: 0.1-beta
 * Description: Interface for adding shortcodes.
 * Author: Human Made Limited
 * Author URI: http://hmn.md
 *
 * License: GPLv2 or later
 *
 *	Copyright (C) 2013 Dominik Schilling
 *
 *	This program is free software; you can redistribute it and/or
 *	modify it under the terms of the GNU General Public License
 *	as published by the Free Software Foundation; either version 2
 *	of the License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU General Public License for more details.
 *
 *	You should have received a copy of the GNU General Public License
 *	along with this program; if not, write to the Free Software
 *	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

require_once( 'inc/class-shortcode-ui.php' );

/**
 * For Developement.
 */
add_action( 'init', function() {

	$instance = new Shortcode_UI();

	$instance->register_shortcode_ui( 'test_shortcode', array(
		'label' => 'Test Shortcode',
		'attrs' => array(
			'id'    => null,
			'align' => 'left',
		),
		'listItemImage' => 'dashicons-carrot',
	) );

	$instance->register_shortcode_ui( 'blockquote', array(
		'label' => 'Blockquote',

		'listItemImage' => 'dashicons-editor-quote',

		// Attributes. Format 'id' => 'default value'
		'attrs' => array(
			'align'     => 'left',
			'source'    => '',
			'sourceurl' => '',
		),

		// Expected - string - the template ID passed to wp.template
		// Autoloads file from templates 'shortcode-$shortcode-$part.tpl.php'
		'template-edit-form' => 'shortcode-blockquote-edit-form',
		'template-render'    => 'shortcode-blockquote-render',
		'template-render-js' => 'shortcode-blockquote-render-js',
	) );

} );


function shortcode_ui_modify_tinyMCE4( $mceInit, $editor_id ) {

	// Toolbar buttons are stored as a comma separated list - lets make them an array.
	$toolbar1 = explode( ',', $mceInit['toolbar1'] );
	$toolbar2 = explode( ',', $mceInit['toolbar2'] );

	// buttons to completely remove.
	$remove = array( 'blockquote' );

	// Remove these buttons if they are found in toolbar1 or toolbar2
	foreach ( $remove as $name ) {

		if ( $key = array_search( $name, $toolbar1 ) ) {
			unset( $toolbar1[$key] );
		}

		if ( $key = array_search( $name, $toolbar2 ) ) {
			unset( $toolbar2[$key] );
		}

	}

	// Convert back to original format.
	$mceInit['toolbar1'] = implode( ',', $toolbar1 );
	$mceInit['toolbar2'] = implode( ',', $toolbar2 );

	$mceInit['content_css'] .= ',' . plugins_url( 'css/shortcode-blockquote.css', __FILE__ );

	return $mceInit;

}

// Modify Tiny_MCE init
add_filter( 'tiny_mce_before_init', 'shortcode_ui_modify_tinyMCE4', 10, 2 );