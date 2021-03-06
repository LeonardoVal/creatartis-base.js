﻿/** Gruntfile for [creatartis-base](http://github.com/LeonardoVal/creatartis-base).
*/
module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	});

	require('@creatartis/creatartis-grunt').config(grunt, {
		globalName: 'base',
		sourceNames: ['__prologue__',
				'core',
				'objects',
				'text',
				'math',
				'functions',
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
			'__epilogue__'],
		deps: [
			{ id: 'sermat', name: 'Sermat', path: 'node_modules/sermat/build/sermat-umd.js' }
		],
		jshint: { loopfunc: true, boss: true, evil: true, proto: true },
		karma: ['Firefox', 'Chrome'],
		connect: {
			console: 'tests/console.html'
		}
	});

	grunt.registerTask('full-test', ['test', 'karma:test_chrome']);
	grunt.registerTask('default', ['build']);
};
