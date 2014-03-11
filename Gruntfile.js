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

var SOURCE_FILES = [ 
	'src/basis.js', 'src/Objects.js',
	'src/text.js', 
	'src/typed.js',
	'src/iterables.js', // iterators and FP utilities. 
	'src/Future.js', 'src/HttpRequest.js', 'src/Parallel.js', // asynchronism
	'src/Events.js', // functions.
	'src/Randomness.js', // math.
	'src/Chronometer.js', 'src/Statistic.js', 'src/Statistics.js', // statistic gathering.
	'src/Logger.js', // logging.
	'src/Verifier.js' // unit testing.
];

module.exports = function(grunt) {
	grunt.file.defaultEncoding = 'utf8';
// Init config. ////////////////////////////////////////////////////////////////
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: { //////////////////////////////////////////////////////////////
			options: {
				separator: '\n\n',
				banner: '"use strict"; ('+ umdWrapper +')(function __init__(){ var exports = { __init__: __init__ };\n',
				footer: '\nreturn exports;\n});'
			},
			build: {
				src: SOURCE_FILES,
				dest: './<%= pkg.name %>.js',
			},
		},
		uglify: { //////////////////////////////////////////////////////////////
		  options: {
			banner: '//! <%= pkg.name %> <%= pkg.version %>\n',
			report: 'min'
		  },
		  build: {
			src: './<%= pkg.name %>.js',
			dest: './<%= pkg.name %>.min.js'
		  }
		},
		docgen: { //////////////////////////////////////////////////////////////
			build: {
				src: SOURCE_FILES,
				dest: 'docs/api.html'
			}
		},
	});

// Load tasks. /////////////////////////////////////////////////////////////////
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	require('./docs/docgen')(grunt); // In-house documentation generation.

// Register tasks. /////////////////////////////////////////////////////////////
	grunt.registerTask('default', ['concat', 'uglify', 'docgen']);
};