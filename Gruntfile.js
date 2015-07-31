/** Gruntfile for [creatartis-base](http://github.com/LeonardoVal/creatartis-base).
*/
module.exports = function(grunt) {
	var SOURCE_FILES = ['src/__prologue__.js',
		'src/core.js', 'src/polyfill.js', 'src/objects.js',
		'src/text.js', 'src/math.js',
		'src/typed.js', 'src/Initializer.js',
		'src/iterables.js', // iterators and FP utilities. 
		'src/Future.js', 'src/HttpRequest.js', 'src/Parallel.js', // asynchronism
		'src/Events.js', // functions.
		'src/Randomness.js', // math.
		'src/Chronometer.js', 'src/Statistic.js', 'src/Statistics.js', // statistic gathering.
		'src/Logger.js', // logging.
		'src/__epilogue__.js'];

	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat_sourcemap: { ////////////////////////////////////////////////////////////////////////
			build: {
				src: SOURCE_FILES,
				dest: 'build/<%= pkg.name %>.js',
				options: {
					separator: '\n\n'
				}
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
	grunt.loadNpmTasks('grunt-concat-sourcemap');
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
	grunt.registerTask('lib', ['bowercopy:lib']);
	grunt.registerTask('compile', ['concat_sourcemap:build', 'jshint:build', 'uglify:build']);
	grunt.registerTask('test', ['test-lib', 'karma:build']);
	grunt.registerTask('test-all', ['test', 'karma:chrome', 'karma:firefox', 'karma:iexplore']);
	grunt.registerTask('build', ['compile', 'test', 'docker:build']);
	grunt.registerTask('default', ['build']);
	
};