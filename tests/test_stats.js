/** test/test_stats.js:
	Test cases for the module <src/stats.js>.
	
	@author <a href="mailto:leonardo.val@creatartis.com">Leonardo Val</a>
	@licence MIT Licence
*/
//TODO Test Statistics.
define(['basis'], function (basis) { "use strict";
	var verifier = new basis.Verifier(),
		Statistic = basis.Statistic,
		iterable = basis.iterable,
		RANDOM = basis.Randomness.DEFAULT;
	
// Test cases for statistics. //////////////////////////////////////////////////
	
	verifier.test("Statistic (basics)", function () {
		for (var i = 0; i < 100; i++) {
			var count = (RANDOM.random() * 10)|0;
			var numbers = RANDOM.randoms(count);
			var stat = new Statistic();
			numbers.forEach(function (n) {
				stat.add(n, '#'+ n);
			});
			var sum = iterable(numbers).sum();
			this.assertSame(count, stat.count());
			this.assertAlmostEqual(sum, stat.sum());
			this.assertAlmostEqual(count && sum / count, stat.average());
			this.assertSame(Math.min.apply(this, numbers), stat.minimum());
			this.assertSame(Math.max.apply(this, numbers), stat.maximum());
			if (count) {
				this.assertSame('#'+ stat.minimum(), stat.minData());
				this.assertSame('#'+ stat.maximum(), stat.maxData());
			} else {
				this.assertUndefined(stat.minData());
				this.assertUndefined(stat.maxData());
			}
			this.assertAlmostEqual(iterable(numbers).map(function (n) {
				return n * n;
			}).sum(), stat.squareSum());
			var variance = count && iterable(numbers).map(function (n) {
				return Math.pow(n - stat.average(), 2);
			}).sum() / count;
			this.assertAlmostEqual(variance, stat.variance());
			this.assertAlmostEqual(Math.sqrt(variance), stat.standardDeviation());
		}
	});
	
	verifier.test("Statistic (keys)", function () {
		var KEYS = basis.Iterable.range(10).map(function (n) {
			return '#'+ n;
		}).toArray();
		for (var i = 0; i < 100; i++) {
			var pair = RANDOM.split(RANDOM.randomInt(10), KEYS);
			// Keys from array.
			var stat = new Statistic(pair[0]);
			pair[0].forEach(function (k) {
				verifier.assert(stat.applies(k), 'new Statistic(', JSON.stringify(pair[0]),') should apply to key "', k, '".');
			});
			pair[1].forEach(function (k) {
				verifier.assertFalse(stat.applies(k), 'new Statistic(', JSON.stringify(pair[0]),') should not apply to key "', k, '".');
			});
			// Keys from whitespace separated string.
			var stat = new Statistic(pair[0].join(' '));
			pair[0].forEach(function (k) {
				verifier.assert(stat.applies(k), 'new Statistic(', JSON.stringify(pair[0]),') should apply to key "', k, '".');
			});
			pair[1].forEach(function (k) {
				verifier.assertFalse(stat.applies(k), 'new Statistic(', JSON.stringify(pair[0]),') should not apply to key "', k, '".');
			});
		}
	});
	
/////////////////////////////////////////////////////////////////////////// Fin.
	return verifier;
});