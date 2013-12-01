/** Gruntfile for basis.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
var umdWrapper = function (init) {
	if (typeof define === 'function' && define.amd) {
		define([], init); // AMD module.
	} else if (typeof module === 'object' && module.exports) { 
		module.exports = init(); // CommonJS module.
	} else {
		(0, eval)('this').basis = init(); // Global namespace.
	}
};

module.exports = function(grunt) {
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: '\n\n',
				// Wrap concatenation in a RequireJS define call.
				banner: '('+ umdWrapper +')(function (){ var exports = {};\n',
				footer: '\nreturn exports;\n});'
			},
			build: {
				src: ['src/level.js', 'src/basis.js', 'src/text.js', 
					'src/iterables.js', 'src/async.js', 'src/typed.js', 
					'src/randomness.js', 'src/functional.js',
					'src/stats.js', 'src/log.js', 'src/unittest.js'],
				dest: './<%= pkg.name %>.js',
			},
		},
		uglify: {
		  options: {
			banner: '//! <%= pkg.name %> <%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n',
			report: 'min'
		  },
		  build: {
			src: './<%= pkg.name %>.js',
			dest: './<%= pkg.name %>.min.js'
		  }
		}
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('default', ['concat', 'uglify']);
};