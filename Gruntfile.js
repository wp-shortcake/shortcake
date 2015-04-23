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

			styles: {
				files: ['css/**/*.scss'],
				tasks: ['styles'],
				options: {
					debounceDelay: 500,
					livereload: true,
					sourceMap: true
				}
			},

			scripts: {
				files: ['js/src/**/*.js', 'js-tests/src/**/*.js', '!js/build/**/*'],
				tasks: ['scripts'],
				options: {
					debounceDelay: 500,
					livereload: true,
					sourceMap: true
				}
			}

		},

		phpcs: {
			plugin: {
				src: './'
			},
			options: {
				bin: "vendor/bin/phpcs --extensions=php --ignore=\"*/vendor/*,*/node_modules/*,dev.php\"",
				standard: "phpcs.ruleset.xml"
			}
		},

		browserify : {

			options: {
				preBundleCB: function(b) {

					b.plugin(remapify, [
						{
							cwd: 'js/src/models',
							src: '**/*.js',
							expose: 'sui-models'
						},
						{
							cwd: 'js/src/controllers',
							src: '**/*.js',
							expose: 'sui-controllers'
						},
						{
							cwd: 'js/src/collections',
							src: '**/*.js',
							expose: 'sui-collections'
						},
						{
							cwd: 'js/src/views',
							src: '**/*.js',
							expose: 'sui-views'
						},
						{
							cwd: 'js/src/utils',
							src: '**/*.js',
							expose: 'sui-utils'
						}
					]);

				}
			},

			dist: {
				files : {
					'js/build/shortcode-ui.js' : ['js/src/shortcode-ui.js'],
					'js/build/field-attachment.js' : ['js/src/field-attachment.js'],
					'js/build/field-color.js' : ['js/src/field-color.js'],
					'js/build/field-post-select.js' : ['js/src/field-post-select.js'],
				},
				options: {
					transform: ['browserify-shim']
				}
			},

			// Proccess Jasmine Tests.
			specs: {
				files : {
					'js-tests/build/specs.js' : ['js-tests/src/**/*Spec.js'],
					'js-tests/build/helpers.js' : ['js-tests/src/**/*Helper.js'],
				},
				options: {
					transform: ['browserify-shim']
				}
			}

		},

		jasmine: {
			shortcodeUI: {
				options: {
					specs: 'js-tests/build/specs.js',
					helpers: 'js-tests/build/helpers.js',
					vendor: [
						'js-tests/vendor/jquery.js',
						'js-tests/vendor/underscore.js',
						'js-tests/vendor/backbone.js',
						'js-tests/vendor/wp-util.js',
						'js-tests/vendor/mock-ajax.js',
					],
				}
			}
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

		wp_readme_to_markdown: {
			your_target: {
				files: {
					'README.md': 'readme.txt'
				},
				options: {
					screenshot_url: 'http://s.wordpress.org/extend/plugins/shortcode-ui/{screenshot}.png',
				}
			},
		},

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

	grunt.loadNpmTasks( 'grunt-sass' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-phpcs' );
	grunt.loadNpmTasks( 'grunt-wp-i18n' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-contrib-jasmine' );

	grunt.registerTask( 'scripts', [ 'browserify', 'jasmine' ] );
	grunt.registerTask( 'styles', [ 'sass' ] );
	grunt.registerTask( 'default', [ 'scripts', 'styles' ] );
	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown']);

	grunt.util.linefeed = '\n';

};
