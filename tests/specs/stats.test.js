define(['basis'], function (basis) { "use strict";
	var RANDOM = basis.Randomness.DEFAULT,
		EPSILON = 1e-100000;
	
	describe("Statistic", function () {
		it("basics", function () {
			for (var i = 0; i < 30; i++) {
				var count = (RANDOM.random() * 10)|0;
				var numbers = RANDOM.randoms(count);
				var stat = new basis.Statistic();
				numbers.forEach(function (n) {
					stat.add(n, '#'+ n);
				});
				var sum = basis.iterable(numbers).sum();
				expect(stat.count()).toBe(count);
				expect(stat.sum()).toBeCloseTo(sum, EPSILON);
				expect(stat.average()).toBeCloseTo(count && sum / count, EPSILON);
				expect(stat.minimum()).toBe(Math.min.apply(this, numbers));
				expect(stat.maximum()).toBe(Math.max.apply(this, numbers));
				if (count) {
					expect(stat.minData()).toBe('#'+ stat.minimum());
					expect(stat.maxData()).toBe('#'+ stat.maximum());
				} else {
					expect(stat.minData()).toBeUndefined();
					expect(stat.maxData()).toBeUndefined();
				}
				expect(stat.squareSum()).toBeCloseTo(basis.iterable(numbers).map(function (n) {
					return n * n;
				}).sum(), EPSILON);
				var variance = count && basis.iterable(numbers).map(function (n) {
					return Math.pow(n - stat.average(), 2);
				}).sum() / count;
				expect(stat.variance()).toBeCloseTo(variance, EPSILON);
				expect(stat.standardDeviation()).toBeCloseTo(Math.sqrt(variance), EPSILON);
			}
		}); // it "basics"
	
		it("keys", function () {
			var KEYS = basis.Iterable.range(10).map(function (n) {
				return ['#'+ n, n];
			}).toObject();
			for (var i = 0; i < 100; i++) {
				var split = RANDOM.split(RANDOM.randomInt(10), Object.keys(KEYS));
				
				var stat = new basis.Statistic(split[0]); // Keys from array.
				split[0].forEach(function (k) {
					expect(stat.applies([k])).toBe(true);
				});
				split[1].forEach(function (k) {
					expect(stat.applies([k])).toBe(false);
				});

				stat = new basis.Statistic(basis.iterable(split[0]).map(function (k) { // Keys from object.
					return [k, KEYS[k]];
				}).toObject());
				split[0].forEach(function (k) {
					expect(stat.applies(basis.obj(k, KEYS[k]))).toBe(true);
				});
				split[1].forEach(function (k) {
					expect(stat.applies(basis.obj(k, KEYS[k]))).toBe(false);
				});
			}
		}); // it "keys".
	}); // describe.
}); // define.