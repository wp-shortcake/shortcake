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

	} );

	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask( 'default', ['sass' ] );

	grunt.util.linefeed = '\n';

};