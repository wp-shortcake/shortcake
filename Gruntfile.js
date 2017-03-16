module.exports = function( grunt ) {

	'use strict';
	var remapify = require('remapify');
	var banner   = '/**\n * <%= pkg.homepage %>\n * Copyright (c) <%= grunt.template.today("yyyy") %>\n * This file is generated automatically. Do not edit.\n */\n';

	// Scripts from WP Core required by Jasmine tests.
	var jasmineCoreScripts = [
		'wp-includes/js/jquery/jquery.js',
		'wp-includes/js/underscore.min.js',
		'wp-includes/js/backbone.min.js',
		'wp-includes/js/wp-util.js',
		'wp-includes/js/shortcode.js',
		'wp-admin/js/editor.js',
	];

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

		// Autoprefix
		postcss: {
			options: {
				map: true, // inline sourcemaps
				processors: [
					require('autoprefixer')(),
				]
			},
			dist: {
				src: 'css/*.css'
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
				bin: "vendor/bin/phpcs --extensions=php --ignore=\"*/php-tests/*,*/vendor/*,*/node_modules/*,dev.php\"",
				standard: "phpcs.ruleset.xml"
			}
		},

		jshint: {
			uses_defaults: ['js/src/**/*.js', 'js-tests/src/**/*.js']
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
					'js/build/shortcode-ui.js' : ['js/src/shortcode-ui.js']
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
						'js-tests/vendor/mock-ajax.js'
					].concat( jasmineCoreScripts.map( function( script ) {
						return 'js-tests/vendor/' + script
					} ) ),
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
					screenshot_url: 'https://s.w.org/plugins/shortcode-ui/{screenshot}.png',
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

	/**
	 * Helper task to keep all the scripts from WordPress core that are required by the Jasmine tests up to date.
	 *
	 * Note the list of scripts needs to be kept up to date.
	 *
	 * Pass the location of your WordPress installation using --abspath.
	 */
	grunt.registerTask( 'updateJasmineCoreScripts', function() {

		var abspath = grunt.option( "abspath" );

		if ( ! grunt.file.exists( abspath + '/wp-includes' ) ) {
			grunt.fail.fatal( 'WordPress install not found. Currently looking here: ' + abspath );
		}

		for ( var i = 0; i < jasmineCoreScripts.length; i++ ) {
			if ( grunt.file.exists( abspath + '/' + jasmineCoreScripts[ i ] ) ) {
				grunt.file.copy(
					abspath + '/' + jasmineCoreScripts[ i ] ,
					'js-tests/vendor/' + jasmineCoreScripts[ i ]
				);
			} else {
				grunt.log.error( 'File not found: ' + abspath + '/' + jasmineCoreScripts[i] );
			}
		}

	});

	grunt.loadNpmTasks( 'grunt-sass' );
	grunt.loadNpmTasks( 'grunt-postcss' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-phpcs' );
	grunt.loadNpmTasks( 'grunt-wp-i18n' );
	grunt.loadNpmTasks( 'grunt-wp-readme-to-markdown' );
	grunt.loadNpmTasks( 'grunt-contrib-jasmine' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );

	grunt.registerTask( 'scripts', [ 'browserify', 'jasmine', 'jshint' ] );
	grunt.registerTask( 'styles', [ 'sass', 'postcss' ] );
	grunt.registerTask( 'default', [ 'scripts', 'styles' ] );
	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown']);

	grunt.util.linefeed = '\n';

};
