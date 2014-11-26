module.exports = function( grunt ) {

	'use strict';

	var banner = '/**\n * <%= pkg.homepage %>\n * Copyright (c) <%= grunt.template.today("yyyy") %>\n * This file is generated automatically. Do not edit.\n */\n';

	// Project configuration
	grunt.initConfig( {
		pkg:    grunt.file.readJSON( 'package.json' ),

		sass: {
			dist: {
				files: {
					'css/shortcode-ui.css' : 'css/sass/shortcode-ui.scss',
					'css/shortcode-ui-editor-styles.css' : 'css/sass/shortcode-ui-editor-styles.scss',
				},
				options: {
					sourceMap: true
				}
			}
		},

		requirejs: {
			dist: {
				options: {
					baseUrl:	'./js/src',
					name:		'main',
					include:	['almond'],
					out:		'./js/shortcode-ui.js',
					wrap:		true,
					paths: {
						'almond':	'../../lib/almond',
						'jquery':	'wrappers/jquery.wrapper',
						'backbone':	'empty:'
					}
				}
			},
			dev: {
				options: {
					baseUrl:	'./js/src',
					name:		'main',
					include:	['almond'],
					out:		'./js/shortcode-ui.js',
					wrap:		true,
					optimize:	'uglify2',
					paths: {
						'almond':	'../../lib/almond',
						'jquery':	'wrappers/jquery.wrapper',
						'backbone':	'empty:'
					},

					generateSourceMaps: 		true,
					preserveLicenseComments:	false
				}
			}
		},

		watch:  {
			sass: {
				files: ['css/*/**/*.scss'],
				tasks: ['sass'],
				options: {
					debounceDelay: 500,
					livereload: true,
					sourceMap: true
				}
			}
		}
	});

	grunt.loadNpmTasks( 'grunt-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-requirejs' );

	grunt.registerTask( 'default', ['sass'] );
	grunt.registerTask( 'build', ['sass', 'requirejs:dist'] );

	grunt.util.linefeed = '\n';

};