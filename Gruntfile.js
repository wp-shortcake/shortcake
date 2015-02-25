module.exports = function( grunt ) {

	'use strict';
	var remapify = require('remapify');
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

		},

		browserify : {
			options: {
				preBundleCB: function(b) {

					b.plugin(remapify, [
						{
							cwd: 'js/models',
							src: '**/*.js',
							expose: 'sui-models'
						},
						{
							cwd: 'js/controllers',
							src: '**/*.js',
							expose: 'sui-controllers'
						},
						{
							cwd: 'js/collections',
							src: '**/*.js',
							expose: 'sui-collections'
						},
						{
							cwd: 'js/views',
							src: '**/*.js',
							expose: 'sui-views'
						},
						{
							cwd: 'js/utils',
							src: '**/*.js',
							expose: 'sui-utils'
						}
					]);

				}
			},
			dist: {
				files : {
					'js/build/shortcode-ui.js' : ['js/**/*.js', '!js/build/**', '!js/field-attachment.js', '!js/field-color.js']
				},
				options: {
					transform: ['browserify-shim']
				}
			},

		},

		addtextdomain: {
		    options: {
		        textdomain: 'shortcode-ui',    // Project text domain.
		    },
		    target: {
		        files: {
		            src: [ '*.php', '**/*.php', '!node_modules/**', '!php-tests/**', '!bin/**' ]
		        }
		    }
		}, //addtextdomain

		makepot: {
		    target: {
		        options: {
		            domainPath: '/languages',
		            mainFile: 'shortcode-ui.php',
		            potFilename: 'shortcode-ui.pot',
		            potHeaders: {
		                poedit: true,
		                'x-poedit-keywordslist': true
		            },
		            type: 'wp-plugin',
		            updateTimestamp: true
		        }
		    }
		}, //makepot
	} );

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks("grunt-wp-i18n");

	grunt.registerTask( 'default', [ 'sass', 'browserify' ] );
	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );

	grunt.util.linefeed = '\n';

};
