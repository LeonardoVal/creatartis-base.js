/** Gruntfile for [creatartis-base](http://github.com/LeonardoVal/creatartis-base).
*/
var path = require('path');

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('creatartis-grunt').config(grunt, {
		src: ['__prologue__',
			'core',
			'polyfill',
			'objects',
			'text',
			'math',
			'functions',
			'typed',
			'Initializer',
			'iterables',
			'Future',
			'HttpRequest',
			'Parallel',
			'Events',
			'Randomness',
			'Chronometer',
			'Statistic',
			'Statistics',
			'Logger',
			'__epilogue__'].map(function (n) {
				return 'src/'+ n +'.js';
			}),
		deps: [
			{ name: 'sermat', id: 'Sermat', path: 'node_modules/sermat/build/sermat-amd.js' }
		],
		jshint: { loopfunc: true, boss: true, evil: true, proto: true },
		karma: ['Firefox', 'Chrome']
	});

	grunt.registerTask('full-test', ['test', 'karma:test_chrome']);
	grunt.registerTask('default', ['build']);
};
