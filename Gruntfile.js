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
    grunt.loadNpmTasks("grunt-wp-i18n");

	grunt.registerTask( 'default', ['sass' ] );
	grunt.registerTask( 'i18n', ['addtextdomain', 'makepot'] );

	grunt.util.linefeed = '\n';

};