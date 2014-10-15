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
			'align'  => 'left',
			'source' => '',
		),

		// Expected - string - the template ID passed to wp.template
		// Autoloads file from templates 'shortcode-$shortcode-$part.tpl.php'
		'templateEditForm'   => 'shortcode-blockquote-edit-form',
		'templateRender'     => 'shortcode-blockquote-render',
		'templateRenderJS'   => 'shortcode-blockquote-render-js',
	) );

} );