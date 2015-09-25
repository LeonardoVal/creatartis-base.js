/** Gruntfile for [creatartis-base](http://github.com/LeonardoVal/creatartis-base).
*/
module.exports = function(grunt) {
	var SOURCE_FILES = ['__prologue__',
		'core', 'polyfill', 'objects',
		'text', 'math',
		'typed', 'Initializer',
		'iterables', // iterators and FP utilities. 
		'Future', 'HttpRequest', 'Parallel', // asynchronism
		'Events', // functions.
		'Randomness', // math.
		'Chronometer', 'Statistic', 'Statistics', // statistic gathering.
		'Logger', // logging.
		'__epilogue__'].map(function (n) {
			return 'src/'+ n +'.js';
		});

	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { ////////////////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n',
				sourceMap: true
			},
			build: {
				src: SOURCE_FILES,
				dest: 'build/<%= pkg.name %>.js'
			},
		},
		jshint: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				options: { // Check <http://jshint.com/docs/options/>.
					loopfunc: true,
					boss: true,
					evil: true,
					proto: true
				},
				src: ['build/<%= pkg.name %>.js', 'tests/specs/*.js'],
			},
		},
		karma: { ///////////////////////////////////////////////////////////////////////////////////
			options: {
				configFile: 'tests/karma.conf.js'
			},
			build: { browsers: ['PhantomJS'] },
			chrome: { browsers: ['Chrome'] },
			firefox: { browsers: ['Firefox'] },
			iexplore: { browsers: ['IE'] }
		},
		uglify: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				src: 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js',
				options: {
					banner: '//! <%= pkg.name %> <%= pkg.version %>\n',
					report: 'min',
					sourceMap: true,
					sourceMapIn: 'build/<%= pkg.name %>.js.map',
					sourceMapName: 'build/<%= pkg.name %>.min.js.map'
				}
			}
		},
		docker: { //////////////////////////////////////////////////////////////////////////////////
			build: {
				src: ['src/**/*.js', 'README.md'],
				dest: 'docs/docker',
				options: {
					colourScheme: 'borland',
					ignoreHidden: true,
					exclude: 'src/__prologue__.js,src/__epilogue__.js'
				}
			}
		}
	});
// Load tasks. /////////////////////////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-docker');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
// Custom tasks ////////////////////////////////////////////////////////////////////////////////////
	grunt.registerTask('test-lib', 'Copies libraries for the testing facilities to use.', function() {
		var path = require('path'),
			pkg = grunt.config.get('pkg');
		grunt.log.writeln("Copied to tests/lib/: "+ [
			'node_modules/requirejs/require.js',
			'node_modules/sermat/build/sermat-amd.js',
			'node_modules/sermat/build/sermat-amd.js.map',
			'build/'+ pkg.name +'.js', 
			'build/'+ pkg.name +'.js.map'
		].map(function (fileToCopy) {
			var baseName = path.basename(fileToCopy);
			grunt.file.copy('./'+ fileToCopy, './tests/lib/'+ baseName);
			return baseName;
		}).join(", ") +".");
	}); // test-lib
		
// Register tasks. /////////////////////////////////////////////////////////////////////////////////
	grunt.registerTask('compile', ['concat:build', 'jshint:build', 'uglify:build']);
	grunt.registerTask('test', ['test-lib', 'karma:build']);
	grunt.registerTask('full_test', ['test', 'karma:chrome', 'karma:firefox', 'karma:iexplore']);
	grunt.registerTask('build', ['compile', 'test', 'docker:build']);
	grunt.registerTask('default', ['build']);
};