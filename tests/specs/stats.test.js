define(['base'], function (base) { "use strict";
	var RANDOM = base.Randomness.DEFAULT,
		EPSILON = 1e-15;
	
	function statFromNumbers(numbers) {
		var stat = new base.Statistic();
		numbers.forEach(function (n) {
			stat.add(n, '#'+ n);
		});
		return stat;
	}
	
	describe("Statistic", function () {
		it("basics", function () {
			for (var i = 0; i < 30; i++) {
				var count = (RANDOM.random() * 10)|0;
				var numbers = RANDOM.randoms(count);
				var stat = new base.Statistic();
				numbers.forEach(function (n) {
					stat.add(n, '#'+ n);
				});
				var sum = base.iterable(numbers).sum();
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
				expect(stat.squareSum()).toBeCloseTo(base.iterable(numbers).map(function (n) {
					return n * n;
				}).sum(), EPSILON);
				var variance = count && base.iterable(numbers).map(function (n) {
					return Math.pow(n - stat.average(), 2);
				}).sum() / count;
				expect(stat.variance()).toBeCloseTo(variance, EPSILON);
				expect(stat.standardDeviation()).toBeCloseTo(Math.sqrt(variance), EPSILON);
			}
		}); // it "basics"
	
		it("keys", function () {
			var KEYS = base.Iterable.range(10).map(function (n) {
				return ['#'+ n, n];
			}).toObject();
			for (var i = 0; i < 100; i++) {
				var split = RANDOM.split(RANDOM.randomInt(10), Object.keys(KEYS));
				
				var stat = new base.Statistic(split[0]); // Keys from array.
				split[0].forEach(function (k) {
					expect(stat.applies([k])).toBe(true);
				});
				split[1].forEach(function (k) {
					expect(stat.applies([k])).toBe(false);
				});

				stat = new base.Statistic(base.iterable(split[0]).map(function (k) { // Keys from object.
					return [k, KEYS[k]];
				}).toObject());
				split[0].forEach(function (k) {
					expect(stat.applies(base.obj(k, KEYS[k]))).toBe(true);
				});
				split[1].forEach(function (k) {
					expect(stat.applies(base.obj(k, KEYS[k]))).toBe(false);
				});
			}
		}); // it "keys".
		
		it("test & inferences", function () {
			var stat, numbers;
			expect(statFromNumbers([]).t_test1().t +'').toBe('NaN'); // Because NaN === NaN is false, of course.
			expect(statFromNumbers([1,1]).t_test1().t).toBe(Infinity);
			expect(statFromNumbers([0,2,0,2]).t_test1().t).toBeCloseTo(2, EPSILON);
			expect(statFromNumbers([0,2,0,2]).t_test1(1).t).toBeCloseTo(0, EPSILON);
			for (var i = 0; i < 30; i++) {
				stat = statFromNumbers(RANDOM.randoms((RANDOM.random() * 10 + 2)|0));
				expect(stat.t_test1(stat.average()).t).toBeCloseTo(0, EPSILON);
				expect(stat.t_test1(-1).t).not.toBeCloseTo(0, EPSILON);
				expect(stat.t_test2(stat).t).toBeCloseTo(0, EPSILON);
			}			
		}); // it "test & inferences"
	}); // describe.
}); // define.