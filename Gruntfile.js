module.exports = function( grunt ) {

	'use strict';
	var remapify = require('remapify');
	var banner   = '/**\n * <%= pkg.homepage %>\n * Copyright (c) <%= grunt.template.today("yyyy") %>\n * This file is generated automatically. Do not edit.\n */\n';

	// Path to WordPress install. Either absoloute or relative to this plugin.
	// Change this by passing --abspath="new/path" as a grunt option.
	var abspath;

	if ( grunt.option( "abspath" ) ) {
		abspath = grunt.option( "abspath" );
	} else if ( 'WP_DEVELOP_DIR' in process.env ) {
		abspath = process.env.WP_DEVELOP_DIR + '/src/';
	} else {
		abspath = '/tmp/wordpress';
	}

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
				bin: "vendor/bin/phpcs --extensions=php --ignore=\"*/vendor/*,*/node_modules/*,dev.php\"",
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
						abspath + '/wp-includes/js/jquery/jquery.js',
						abspath + '/wp-includes/js/underscore.min.js',
						abspath + '/wp-includes/js/backbone.min.js',
						abspath + '/wp-includes/js/wp-util.js',
						abspath + '/wp-includes/js/shortcode.js',
						abspath + '/wp-admin/js/editor.js',
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

	grunt.registerTask( 'checkTestEnv', function() {
		if ( ! grunt.file.exists( abspath ) ) {
			grunt.fail.fatal( 'WordPress test install not found. See readme for more information.' );
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

	grunt.registerTask( 'scripts', [ 'browserify', 'jshint' ] );
	grunt.registerTask( 'styles', [ 'sass', 'postcss' ] );
	grunt.registerTask( 'default', [ 'scripts', 'styles' ] );
	grunt.registerTask( 'test', [ 'checkTestEnv', 'jasmine' ] );
	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );
	grunt.registerTask( 'readme', ['wp_readme_to_markdown']);

	grunt.util.linefeed = '\n';

};
